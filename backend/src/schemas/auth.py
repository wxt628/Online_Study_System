from pydantic import BaseModel

class LoginRequest(BaseModel):
	student_id: str
	password: str

class LoginResponse(BaseModel):
	token: str
	user_id: int
	student_id: str
