import React, { useState, useContext } from "react";
import { Button, TextField } from "@mui/material";
import Image from "next/image";
import Logo from "../../public/images/logo.png";
import styled from "styled-components";
import { DispatchContext } from "../../pages/_app";
import * as Api from "../../api";

function Login({ open, handleClose, setRegister }) {
    const [email, setEmail] = useState<String>("");
    const [password, setPassword] = useState<String>("");
    const dispatch = useContext(DispatchContext);

    const validateEmail = (email: String) => {
        return email
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 4;
    const isFormValid = isEmailValid && isPasswordValid;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await Api.post("users/login", {
                email,
                password,
            });

            const user = res.data;
            const jwtToken = user.token;
            sessionStorage.setItem("userToken", jwtToken);

            dispatch({
                type: "LOGIN_SUCCESS",
                payload: user,
            });

        } catch (err) {
            console.error("이메일 또는 비밀번호가 유효하지 않습니다.");
        }
    }

    return (
        <Wrapper>
            <div style={{ textAlign: "right" }}>
                <CloseButton
                    variant="text"
                    onClick={handleClose}
                >
                    x
                </CloseButton>
            </div>
            <LogoImage>
                <Image
                    src={Logo}
                    alt="logo"
                    width={40}
                    height={40}
                />
            </LogoImage>
            <SignInForm>
                <TextField
                    type="email"
                    style={{
                        width: "380px",
                        height: "40px",
                    }}
                    label="E-MAIL"
                    size="small"
                    onChange={(e) => setEmail(e.target.value)}
                    helperText={!isEmailValid && "이메일 형식이 올바르지 않습니다."}
                />
                <TextField
                    type="password"
                    style={{
                        width: "380px",
                        height: "40px",
                    }}
                    label="PASSWORD"
                    size="small"
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    helperText={!isPasswordValid && "비밀번호는 4글자 이상입니다."}
                />
                <SignInButton
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                >
                    Sign in
                </SignInButton>
            </SignInForm>
            <Or>or</Or>
            <FindWrapper>
                <Button
                    variant="text"
                    className=""
                >
                    비밀번호 찾기
                </Button>
                <span>|</span>
                <Button
                    variant="text"
                    onClick={() => {
                        handleClose
                        setRegister(true)
                    }}
                >
                    회원가입  
                </Button>
            </FindWrapper>
        </Wrapper>
    )
}

export default Login;


const Wrapper = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 520px;
    height: 550px;
    background-color: white;
    border-radius: 20px;
    padding: 40px;
`;

const CloseButton = styled(Button)`
    color: black;
    :hover {
        background-color: white;
    }
`;

const SignInForm = styled.div`
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
`;

const LogoImage = styled.div`
    width: 100%;
    height: 100px;
    text-align: center;
`;

const FindWrapper = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    margin: 10px auto;
    padding-left: 110px; 
    color: var(--green);
`;

const SignInButton = styled(Button)`
    width: 380px;
    height: 40px;
    background-color: var(--green);
    margin-top: 20px;
    border-radius: 50px;
    color: var(--deepgreen);
    :hover {
        background-color: var(--deepgreen);
        color: white;
    }
`;

const Or = styled.div`
    width: 90%;
    display: flex;
    align-items: center;
    font-size: 14px;
    margin: 20px auto;
    color: var(--green);
    ::before,
    ::after {
        content: "";
        width: 40%;
        background-color: var(--green);
        height: 0.5px;
        font-size: 0px;
        line-height: 0px;
        margin: auto;
    }
`;