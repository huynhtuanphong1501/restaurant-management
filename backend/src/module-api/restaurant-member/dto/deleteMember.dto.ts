import { IsString } from "class-validator";

export class DeleteMemberDTO {
    @IsString()
    user_id: string;
}