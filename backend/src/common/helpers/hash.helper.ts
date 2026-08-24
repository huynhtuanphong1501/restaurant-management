import bcrypt from 'bcrypt';

export const hash = (data:any) => { 
    const bhash = bcrypt.hashSync(data, 10);
    return bhash;
}

export const compareHash = (data1: any, data2: any) => {
    const compare = bcrypt.compareSync(data1, data2);
    return compare;
}