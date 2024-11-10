import { isBoolean, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { User } from "src/modules/user/entities/user.entity";
import { ManyToOne } from "typeorm";
export class CreateFeedBackDto {


    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsNumber()
    rating: number

    @ManyToOne(() => User, (user) => user)
    user: User;

}


