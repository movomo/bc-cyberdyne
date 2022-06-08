const User = require("../models/funcs/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const setUtil = require("../utils/setUtil");

const userService = {
    addUser: async ({ nickname, email, password }) => {
        const user = await User.findByEmail({ email });

        if (user) {
            throw new Error(
                "이 이메일은 현재 사용중입니다. 다른 이메일을 입력해 주세요."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = { nickname, email, password: hashedPassword };

        const createdNewUser = await User.create({ newUser });
        return { message: "success", data: createdNewUser };
    },

    getUser: async ({ email, password }) => {
        const user = await User.findByEmail({ email });

        if (!user) {
            throw new Error(
                "해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요."
            );
        }

        const correctPasswordHash = user.password;
        const isPasswordCorrect = await bcrypt.compare(
            password,
            correctPasswordHash
        );

        if (!isPasswordCorrect) {
            throw new Error(
                "비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요."
            );
        }

        const secretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userId: user.id }, secretKey);

        const { id, nickname, picture, totalPoint } = user;

        const loginUser = {
            token,
            id,
            nickname,
            picture,
            totalPoint,
        };

        return { message: "success", data: loginUser };
    },

    updateProfile: async ({ id, updateData }) => {
        let user = await User.findById({ id });

        if (!user) {
            throw new Error(
                "이미 탈퇴했거나 존재하지 않는 사용자입니다. 다시 한 번 확인해 주세요."
            );
        }
        const toUpdate = setUtil.compareValues(updateData, user);

        const count = await User.update({ id, toUpdate });
        return { message: "success", count };
    },

    updatePassword: async ({ id, password }) => {
        let user = await User.findById({ id });

        if (!user) {
            throw new Error(
                "이미 탈퇴했거나 존재하지 않는 사용자입니다. 다시 한 번 확인해 주세요."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const toUpdate = { password: hashedPassword };

        user = await User.update({ id, toUpdate });
        return { message: "success", data: user };
    },

    deleteUser: async ({ id }) => {
        const user = await User.findById({ id });

        if (!user) {
            throw new Error(
                "이미 탈퇴했거나 존재하지 않는 사용자입니다. 다시 한 번 확인해 주세요."
            );
        }

        await User.delete({ id });
    },
};

module.exports = userService;
