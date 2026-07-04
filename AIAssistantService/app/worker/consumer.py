import asyncio
import json
import logging
import aio_pika
from app.core.config import settings
from app.worker.handlers import handle_user_created_or_updated, handle_project_created_or_updated, handle_project_members_synced

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
        
        await self._close_safe()
        logger.info("RabbitMQ connections closed successfully.")

    async def _close_safe(self) -> None:
        """
        Safely closes channels and connections to prevent leaks.
        """
        if self.channel:
            try:
                await self.channel.close()
            except Exception:
                pass
            self.channel = None
        if self.connection:
            try:
                await self.connection.close()
            except Exception:
                pass
            self.connection = None


    async def _consume_loop(self) -> None:
        """
        Robust connection loop that automatically attempts reconnection on failures.
        """
        rabbitmq_url = f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASS}@{settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}/"
        
        while True:
            try:
                await self._close_safe()
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

                # --- Project & Member Events ---
                ex_project_created = await self.channel.declare_exchange(
                    "EventBus.Messages.Events:ProjectCreatedEvent",
                    aio_pika.ExchangeType.FANOUT,
                    durable=True
                )
                ex_project_updated = await self.channel.declare_exchange(
                    "EventBus.Messages.Events:ProjectUpdatedIntegrationEvent",
                    aio_pika.ExchangeType.FANOUT,
                    durable=True
                )
                ex_members_synced = await self.channel.declare_exchange(
                    "EventBus.Messages.Events:ProjectMembersSyncedEvent",
                    aio_pika.ExchangeType.FANOUT,
                    durable=True
                )

                q_project_created = await self.channel.declare_queue(
                    "ai-assistant-project-created",
                    durable=True
                )
                q_project_updated = await self.channel.declare_queue(
                    "ai-assistant-project-updated",
                    durable=True
                )
                q_members_synced = await self.channel.declare_queue(
                    "ai-assistant-members-synced",
                    durable=True
                )

                await q_project_created.bind(ex_project_created)
                await q_project_updated.bind(ex_project_updated)
                await q_members_synced.bind(ex_members_synced)

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

                # Project event callback
                async def on_project_message(message: aio_pika.abc.AbstractIncomingMessage):
                    async with message.process():
                        try:
                            body = json.loads(message.body.decode())
                            logger.info(f"Received project event from queue")
                            await handle_project_created_or_updated(body)
                        except json.JSONDecodeError:
                            logger.error(f"Failed to decode JSON from project event: {message.body}")
                        except Exception as e:
                            logger.exception(f"Error processing project event: {e}")

                # Members synced event callback
                async def on_members_message(message: aio_pika.abc.AbstractIncomingMessage):
                    async with message.process():
                        try:
                            body = json.loads(message.body.decode())
                            logger.info(f"Received members synced event from queue")
                            await handle_project_members_synced(body)
                        except json.JSONDecodeError:
                            logger.error(f"Failed to decode JSON from members event: {message.body}")
                        except Exception as e:
                            logger.exception(f"Error processing members synced event: {e}")

                await q_project_created.consume(on_project_message)
                await q_project_updated.consume(on_project_message)
                await q_members_synced.consume(on_members_message)

                logger.info("RabbitMQ Consumer started listening on queues successfully.")
                
                # Keep loop alive while connection and channel are open and not closed
                while self.connection and not self.connection.is_closed and self.channel and not self.channel.is_closed:
                    await asyncio.sleep(5)
                
                if self.connection and self.connection.is_closed:
                    logger.warning("RabbitMQ connection was closed. Triggering reconnection...")
                elif self.channel and self.channel.is_closed:
                    logger.warning("RabbitMQ channel was closed. Triggering reconnection...")
                    
            except asyncio.CancelledError:
                logger.info("RabbitMQ consumer task cancelled.")
                break
            except Exception as e:
                logger.error(f"RabbitMQ Connection failed or lost: {e}. Reconnecting in 10 seconds...")
                await asyncio.sleep(10)
        
        # Final cleanup on exit
        await self._close_safe()
