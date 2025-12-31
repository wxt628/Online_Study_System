from pydantic import BaseModel
from datetime import datetime

class CourseOut(BaseModel):
	course_id: int
	course_code: str
	name: str
	teacher: str
	semester: str

class AssignmentOut(BaseModel):
	assignment_id: int
	course_id: int
	title: str
	description: str
	attachment_url: str
	deadline: str
	created_at: str

class SubmissionOut(BaseModel):
	submission_id: int
	assignment_id: int
	user_id: int
	file_url: str
	submitted_at: datetime
	score: int | None
	feedback: str | None
