import jwt from 'jsonwebtoken';

const genToken = (userId) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: "10y" },
            (err, token) => {
                if (err) reject(err);
                else resolve(token);
            }
        );
    });
};

export default genToken;
