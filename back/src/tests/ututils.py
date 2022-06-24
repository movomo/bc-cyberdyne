#! /usr/bin/env python3

import json
# import unittest

from http.client import HTTPConnection
from http import HTTPStatus
from pathlib import Path


class ConfigMixin(object):
    jsonpath: str
    config: dict
    root: str
    headers: str

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        with Path(self.jsonpath).open() as json_in:
            self.config = json.load(json_in)

        self.root = f"{self.config['host']}:{self.config['port']}"
        self.headers = json.dumps({'Content-Type': 'application/json'})


class AuthMixin(object):
    """로그인이 필요한 서비스 접근을 위해 회원가입/탈퇴를 합니다."""
    connection: HTTPConnection
    nickname: str
    email: str
    password: str
    userId: str
    token: str
    headers: str
    registered: bool = False
    loggedin: bool = False

    def setUp(self) -> None:
        self.connection = HTTPConnection(
            self.config['host'], self.config['port']
        )

        # 회원 가입을 시도합니다.
        authdata = self.config['auth']
        body = json.dumps(
            {
                'nickname': authdata['nickname'],
                'email': authdata['email'],
                'password': authdata['password'],
            }
        )

        self.connection.request(
            'POST',
            f'{self.root}/users/register',
            body=body,
            headers=self.headers
        )
        res = self.connection.getresponse()
        self.assertEqual(
            res.status, HTTPStatus.CREATED, 'Registration failed'
        )
        self.registered = True

        data = json.loads(res.read())['data']
        self.nickname = data['nickname']
        self.email = data['email']
        self.userId = data['userId']
        self.headers = json.dumps(
            {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.token}'
            }
        )

        # 로그인을 시도합니다.
        body = json.dumps(
            {
                'email': self.email,
                'password': self.password
            }
        )
        self.connection.request(
            'POST',
            f'{self.root}/users/login',
            body=body,
            headers=self.headers
        )

        res = self.connection.getresponse()
        self.assertEqual(
            res.status, HTTPStatus.OK, 'Login failed'
        )
        self.loggedin = True
        data = json.loads(res.read())['data']
        self.token = data['token']

    def tearDown(self) -> None:
        self.connection.request(
            'DELETE',
            f'{self.root}/users/{self.userId}',
            headers=self.headers
        )

        res = self.connection.getresponse()
        self.connection.close()
        self.assertEqual(
            res.status,
            HTTPStatus.NO_CONTENT,
            'Unregistration failed'
        )
