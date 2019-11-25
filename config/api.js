const baseURL = 'http://127.0.0.1:7001'

/**
 * 用户模块
 */
const registerApi = `${baseURL}/api/v1/user/register` // 注册接口
const loginApi = `${baseURL}/api/v1/user/login` // 登陆接口

export {
  registerApi,
  loginApi
}
