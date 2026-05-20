"""
RabbitMQ Consumer - Đăng ký nhận sự kiện UserCreated và UserUpdated
từ Identity Service để đồng bộ bảng users trong DocumentIntelligence DB.
"""
import json
import logging
import sys
import os

# Thêm thư mục gốc của service vào sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import pika
from app.core.config import settings
from app.core.database import SessionLocal
from app.worker.handlers import handle_user_created, handle_user_updated

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Mapping exchange/routing key → handler
EVENT_HANDLERS = {
    "EventBus.Messages.Events:UserCreatedEvent": handle_user_created,
    "EventBus.Messages.Events:UserUpdatedEvent": handle_user_updated,
}

QUEUE_NAME = "docintel-user-sync-queue"


def on_message(channel, method, properties, body):
    """Callback xử lý tin nhắn từ RabbitMQ."""
    try:
        # MassTransit wraps message trong envelope
        envelope = json.loads(body)

        # Lấy payload thực tế từ MassTransit envelope
        message_type = None
        payload = envelope

        # MassTransit format: {"messageType": ["urn:message:..."], "message": {...}}
        if "messageType" in envelope:
            message_types = envelope.get("messageType", [])
            payload = envelope.get("message", envelope)

            # Tìm handler phù hợp
            for mt in message_types:
                # Chuẩn hóa message type: "urn:message:EventBus.Messages.Events:UserCreatedEvent"
                for key in EVENT_HANDLERS:
                    if key in mt:
                        message_type = key
                        break
                if message_type:
                    break

        if message_type and message_type in EVENT_HANDLERS:
            db = SessionLocal()
            try:
                EVENT_HANDLERS[message_type](payload, db)
                db.commit()
                logger.info(f"Xử lý sự kiện {message_type} thành công: {payload.get('Id', 'N/A')}")
            except Exception as e:
                db.rollback()
                logger.error(f"Lỗi xử lý sự kiện {message_type}: {e}")
            finally:
                db.close()
        else:
            logger.warning(f"Không tìm thấy handler cho message type: {envelope.get('messageType', 'unknown')}")

        channel.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.error(f"Lỗi parsing message: {e}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def start_consumer():
    """Khởi động consumer kết nối RabbitMQ."""
    credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)
    connection_params = pika.ConnectionParameters(
        host=getattr(settings, "RABBITMQ_HOST", "localhost"),
        credentials=credentials
    )

    connection = pika.BlockingConnection(connection_params)
    channel = connection.channel()

    # Khai báo exchange và queue (MassTransit convention)
    channel.exchange_declare(exchange="EventBus.Messages.Events:UserCreatedEvent", exchange_type="fanout", durable=True)
    channel.exchange_declare(exchange="EventBus.Messages.Events:UserUpdatedEvent", exchange_type="fanout", durable=True)

    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    # Bind queue vào các exchange
    channel.queue_bind(queue=QUEUE_NAME, exchange="EventBus.Messages.Events:UserCreatedEvent")
    channel.queue_bind(queue=QUEUE_NAME, exchange="EventBus.Messages.Events:UserUpdatedEvent")

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=on_message)

    logger.info(f"🐰 RabbitMQ Consumer đang lắng nghe trên queue: {QUEUE_NAME}")
    logger.info("Đang chờ sự kiện UserCreated/UserUpdated từ Identity Service...")

    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        logger.info("Consumer dừng bởi người dùng.")
        channel.stop_consuming()
    finally:
        connection.close()


if __name__ == "__main__":
    start_consumer()
