const axios = require("axios");

const checkIn = async (cookie) => {
  return axios({
    method: "post",
    url: "https://glados.rocks/api/user/checkin",
    headers: {
      Cookie: cookie,
      "content-type": "application/json;charset=UTF-8",
    },
    data: {
      token: "glados.network",
    },
  });
};

const getStatus = async (cookie) => {
  return axios({
    method: "get",
    url: "https://glados.rocks/api/user/status",
    headers: {
      Cookie: cookie,
    },
  });
};

const checkInAndGetStatus = async (cookie) => {
  const checkInMessage = (await checkIn(cookie))?.data?.message;

  const userStatus = (await getStatus(cookie))?.data?.data;
  const email = userStatus?.email;
  const leftDays = parseInt(userStatus?.leftDays);

  return {
    账号: email,
    天数: leftDays,
    签到情况: checkInMessage,
  };
};

const pushplus = (token, infos) => {
  const email = infos?.[0]["账号"];
  const LeftDays = infos?.[0]["天数"];
  const checkStatus = infos?.[0]["签到情况"];
  const data = {
    token,
    title: `剩${LeftDays}天,${checkStatus}!`,
    content: JSON.stringify(infos),
    template: "json",
  };
  console.log("PushPlus params >>", data);
  return axios({
    method: "post",
    url: `http://www.pushplus.plus/send`,
    data,
  });
};

const GLaDOSCheckIn = async () => {
  try {
    const cookies = process.env.COOKIES?.split("&&") ?? [];

    const infos = await Promise.all(
      cookies.map(async (cookie) => await checkInAndGetStatus(cookie))
    );

    console.log("CheckIn result>>", infos);

    const PUSHPLUS = process.env.PUSHPLUS;

    if (PUSHPLUS && infos.length) {
      const pushResult = (await pushplus(PUSHPLUS, infos))?.data?.msg;
      console.log(pushResult);
    }
  } catch (error) {
    console.log(error);
  }
};

GLaDOSCheckIn();
