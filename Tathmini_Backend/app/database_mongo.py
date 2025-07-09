import motor.motor_asyncio
from pymongo.errors import ConnectionFailure
from .config import settings

# MongoDB client
client = None
db = None

async def connect_to_mongo():
    """Connect to MongoDB."""
    global client, db
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
        # Verify connection is successful
        await client.admin.command('ping')
        db = client[settings.MONGODB_DB]
        print("Connected to MongoDB")
        return db
    except ConnectionFailure:
        print("Failed to connect to MongoDB")
        raise

async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

async def get_mongo_db():
    """Get MongoDB database instance."""
    global db
    if db is None:
        db = await connect_to_mongo()
    return db

# Collections
async def get_odk_submissions_collection():
    """Get ODK submissions collection."""
    mongo_db = await get_mongo_db()
    return mongo_db.odk_submissions

async def get_odk_forms_collection():
    """Get ODK forms collection."""
    mongo_db = await get_mongo_db()
    return mongo_db.odk_forms