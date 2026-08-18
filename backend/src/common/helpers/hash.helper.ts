import bcrypt from 'bcrypt';

export const hash = (data:any) => { 
    const bhash = bcrypt.hashSync(data, 10);
    return bhash;
}