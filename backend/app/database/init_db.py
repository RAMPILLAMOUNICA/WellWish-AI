from app.database import Base, engine

from app.models.user import User
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal

Base.metadata.create_all(bind=engine)

print("Database Created Successfully")