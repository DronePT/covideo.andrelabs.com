interface UserChannelMap {
  [key: string]: {channel: string; userName: string};
}

export const userChannelMap: UserChannelMap = {};

export const setUserChannel = (socketId: string, channel: string, userName: string) => {
  userChannelMap[socketId] = { channel, userName: userName || socketId };
};

export const removeUserChannel = (socketId: string) => {
  Reflect.deleteProperty(userChannelMap, socketId);
};

export const getUserChannel = (socketId: string) => {
  const { channel } = userChannelMap[socketId] || {};

  return channel;
};

export const getUserName = (socketId: string) => {
  const { userName } = userChannelMap[socketId] || {};

  return userName;
};
