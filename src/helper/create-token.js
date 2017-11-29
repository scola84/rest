import { sign } from 'jsonwebtoken';

export default function createToken(config) {
  return (box, data, context) => {
    return context === 'decide' ? {} : {
      token: sign({
        type: 'user',
        id: data.user.user_id
      }, config.key)
    };
  };
}
