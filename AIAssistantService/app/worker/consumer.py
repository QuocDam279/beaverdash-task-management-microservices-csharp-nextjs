import asyncio
import json
import logging
import aio_pika
from app.core.config import settings
from app.worker.handlers import handle_user_created_or_updated

logger = logging.getLogger(__name__)

class RabbitMQConsumer:
    def __init__(self):
        self.connection = None
        self.channel = None
        self._main_loop_task = None

    async def start(self) -> None:
        """
        Starts the background RabbitMQ consumer task.
        """
        self._main_loop_task = asyncio.create_task(self._consume_loop())
        logger.info("RabbitMQ background task initiated.")

    async def stop(self) -> None:
        """
        Stops consumption and closes RabbitMQ connections.
        """
        if self._main_loop_task:
            self._main_loop_task.cancel()
            try:
                await self._main_loop_task
            except asyncio.CancelledError:
                pass
        
        if self.channel:
            await self.channel.close()
        if self.connection:
            await self.connection.close()
        logger.info("RabbitMQ connections closed successfully.")

    async def _consume_loop(self) -> None:
        """
        Robust connection loop that automatically attempts reconnection on failures.
        """
        rabbitmq_url = f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASS}@{settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}/"
        
        while True:
            try:
                logger.info(f"Connecting to RabbitMQ at {settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}...")
                self.connection = await aio_pika.connect_robust(rabbitmq_url)
                self.channel = await self.connection.channel()
                
                # Prefetch count ensures smooth load balancing
                await self.channel.set_qos(prefetch_count=10)

                # MassTransit publishes to fanout exchanges named "Namespace:TypeName"
                ex_created = await self.channel.declare_exchange(
                    "EventBus.Messages.Events:UserCreatedEvent",
                    aio_pika.ExchangeType.FANOUT,
                    durable=True
                )
                ex_updated = await self.channel.declare_exchange(
                    "EventBus.Messages.Events:UserUpdatedEvent",
                    aio_pika.ExchangeType.FANOUT,
                    durable=True
                )

                # Declare local queues for the AI service
                q_created = await self.channel.declare_queue(
                    "ai-assistant-user-created",
                    durable=True
                )
                q_updated = await self.channel.declare_queue(
                    "ai-assistant-user-updated",
                    durable=True
                )

                # Bind queues to exchanges
                await q_created.bind(ex_created)
                await q_updated.bind(ex_updated)

                # Setup consumption callbacks
                async def on_message(message: aio_pika.abc.AbstractIncomingMessage):
                    async with message.process():
                        try:
                            body = json.loads(message.body.decode())
                            logger.info(f"Received event from queue: {message.routing_key}")
                            await handle_user_created_or_updated(body)
                        except json.JSONDecodeError:
                            logger.error(f"Failed to decode JSON body from message: {message.body}")
                        except Exception as e:
                            logger.exception(f"Error processing RabbitMQ message: {e}")

                await q_created.consume(on_message)
                await q_updated.consume(on_message)

                logger.info("RabbitMQ Consumer started listening on queues successfully.")
                
                # Keep loop alive while connection is open
                while not self.connection.is_closed:
                    await asyncio.sleep(5)
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"RabbitMQ Connection failed or lost: {e}. Reconnecting in 10 seconds...")
                await asyncio.sleep(10)
