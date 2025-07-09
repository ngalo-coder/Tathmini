from fastapi import APIRouter

router = APIRouter()

@router.get("/users")
async def get_users():
    """
    Get a list of users.
    This is a placeholder endpoint.
    """
    return [
        {"id": 1, "name": "User 1"},
        {"id": 2, "name": "User 2"},
        {"id": 3, "name": "User 3"},
    ]

@router.get("/users/{user_id}")
async def get_user(user_id: int):
    """
    Get a specific user by ID.
    This is a placeholder endpoint.
    """
    return {"id": user_id, "name": f"User {user_id}"}