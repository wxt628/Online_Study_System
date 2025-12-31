from pydantic import BaseModel
from typing import Optional

class UserInfomation(BaseModel):
	user_id: str
	student_id: str
	name: str
	email: Optional[str]
	phone: Optional[str]
	avatar_url: Optional[str]
	created_at: str
	updated_at: str
