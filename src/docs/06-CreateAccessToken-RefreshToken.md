# Tạo Access Token(AT) và Refresh Token(RT)

## fix lại kiểu dữ liệu cho `RegisterController`

- trong router Register có (middleware, controller-handler)
  controller của Register là `RegisterController` chỉ đang nhận request có body chứa email và password

  ```ts
  export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body //thằng body này có kiểu là any
  ...
  ```

- ta muốn chỉnh lại cho chuẩn kiểu dữ liệu, nếu ta đưa chuột vào req ta sẽ thấy kiểu dữ liệu như sau
  ![Alt text](./attachments/image-48.png)

  - từ đây suy ra 1 req gồm ParamsDictionary, resBody, reqBody, ReqQuery, Locals
  - ta thay thế đoạn request bằng phần đó luôn để định dạng lại

  ```ts
  import {ParamsDictionary} from 'express-serve-static-core'

  // ở đây ta mô tả resBody, reqBody là any, còn các trường ReqQuery, Locals thì ta chưa dùng đến nên k định nghĩa
  export const registerController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { email, password } = req.body
  ...
  ```

  - giờ ta ta thấy rằng mình có 2 `any`, `any` đầu tiên dùng để định nghĩa cho resBody
    `any` thứ 2 mình định nghĩa cho reqBody(những gì người client truyền lên)

- và giờ ta sẽ tạo 1 interface để định nghĩa lại `reqBody` của `register` thay vì để any

  - ta vào thư mục `models` (nơi chứa các định nghĩa dữ liệu) và tạo folder `requests`(chứa các định interface định nghĩa kiểu dữ liệu cho các request)
  - tạo file `User.requests.ts` chứa các interface định nghĩa các reqBody của các controller, và trong này ta sẽ định nghĩa là `reqBody` của `registerController`
  - thêm vào file `User.requests.ts` 1 định nghĩa interface

    ```ts
    export interface RegisterReqBody {
      name: string
      email: string
      password: string
      confirm_password: string
      date_of_birth: string
    }
    ```

  - vào file `registerController` thay any thứ 2 lại thành `RegisterReqBody`

    ```ts
    export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
    const { email, password } = req.body
    //giờ thì ta đã thấy body là RegisterReqBody
    //việc này sẽ giúp code nhắc ta là trong body có gì
    //và ta biết đã biết chắc body là RegisterReqBody
    //nên ta cũng k cần lấy lẽ từng cái email,pasword làm gì
        ...
    ```

  - giờ thì ta đã thấy `body` là `RegisterReqBody`
    - việc này sẽ giúp code nhắc ta là trong body có gì
    - và ta biết đã biết chắc `body` là `RegisterReqBody`
    - nên ta cũng k cần lấy lẽ từng cái `email,pasword` làm gì

- ta thay fix đoạn `registerController` như sau
  ```ts
  export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  // const { email, password } = req.body //bỏ
  try {
  const result = await usersService.register(req.body) // thay luôn
  ```
- ta vào `usersService.register(req.body)` tức `users.services.ts` và chỉnh lại parameter về thành `RegisterReqBody` thay vì chỉ là email, password

  ```ts
  import { RegisterReqBody } from '~/models/requests/User.requests'

    class UsersService {
        async register(payload: RegisterReqBody) {
            //payload là những gì người dùng gửi lên
            const result = await databaseService.users.insertOne(
            new User({
                ...payload,
                date_of_birth: new Date(payload.date_of_birth)
                //vì User.schema.ts có date_of_birth là Date
                //nhưng mà người dùng gửi lên payload là string
        })
        ...
    )
  ```

- fix nhẹ lại required cho các trường dữ liệu trong `User.schema.ts`
  ![Alt text](./attachments/image-49.png)

- ta sẽ tiến hành tách `enum UserVerifyStatus` ra file riêng để tiện quản lý sau này

  ```ts
  enum UserVerifyStatus {
    Unverified, // chưa xác thực email, mặc định = 0
    Verified, // đã xác thực email
    Banned // bị khóa
  }
  ```

  - trong folder `containts`, tạo file `enums.ts`
  - đem đoạn `enum UserVerifyStatus` bỏ vào `enums.ts`

    ```ts
    export enum UserVerifyStatus {
      Unverified, // chưa xác thực email, mặc định = 0
      Verified, // đã xác thực email
      Banned // bị khóa
    }
    ```

- file `User.schema.ts` thì import `UserVerifyStatus`

  ```ts
  import { UserVerifyStatus } from '~/constants/enums'
  ```

- giờ ta bật postman và test thử lại thôi
  ![Alt text](./attachments/image-50.png)
  email đã tồn tại
  ![Alt text](./attachments/image-51.png)
  trong mongo
  ![Alt text](./attachments/image-52.png)

- nếu để ý là server k nhận cái confirm_password của ta
  - đó là nhờ vào vào class User, nên nó chỉ nhận những cái cần thiết từ reqBody thay vì tất cả
- ta có thể thấy rằng password của mình bị lưu trực tiếp (password thô) và nếu server bị tấn công
  thì chắc chắn hacker dể dàng có được thông tin này, ta phải mã hóa chúng trước khi lưu lên server

- ta sẽ dùng [`SHA-256`](https://futurestud.io/tutorials/node-js-calculate-a-sha256-hash) là một thuật toán mã hóa, để giúp mình mã hóa password trước khi lưu lên server, đây là có sẵn, thông qua package `crypto`
- bây giờ ta tiến hành mã hóa `password` trước khi gữi lên server

  - trong file `.env` ta tạo `PASSWORD_SECRET='diepdeptrai'`
  - trong thư mục `utils` (src/utils: Chứa các file chứa các hàm tiện ích, như mã hóa, gửi email, ...) ta tạo `crypto.ts`

    ```ts
    import { createHash } from 'crypto'

    //đoạn code này lấy từ trang chủ của SHA256
    function sha256(content: string) {
      return createHash('sha256').update(content).digest('hex')
    }

    //hàm mã hóa password kèm 1 mật khẩu bí mật do mình tạo ra
    export function hashPassword(password: string) {
      return sha256(password + process.env.PASSWORD_SECRET)
    }
    ```

  - trong `users.services.ts` ta sẽ override lại password bằng password đã được mã hóa trước khi truyền lên

    ```ts
    import { hashPassword } from '~/utils/crypto'

    class UsersService {
    async register(payload: RegisterReqBody) {
        ...
        new User({
            ...payload,
            date_of_birth: new Date(payload.date_of_birth),
            //vì User.schema.ts có date_of_birth là Date
            //nhưng mà người dùng gửi lên payload là string
            password: hashPassword(payload.password)
        })
        ...
    }
    ```

## tạo access token và refresh token

- để tạo at hay rt thì ta đều phải có [jwt](https://www.npmjs.com/package/jsonwebtoken) (json web token)

- ta sẽ cài đặt bằng npm
  ```bash
  npm install jsonwebtoken
  npm install @types/jsonwebtoken -D
  ```
- có rất nhiều cách để tạo ra chữ ký định danh trong token, nhưng ở đây mình sẽ chọn tạo 1 chữ ký không đồng bộ, vì mình muốn nó tạo chữ ký trước rồi mới thực hiện hành động
  ![Alt text](./attachments/image-53.png)

- đây cũng là một tiện ích nên mình tạo `jwt.ts` trong folder `utils`

  ```ts
  import jwt from 'jsonwebtoken'
  //privateKey là password để được quyền tạo chữ ký jwt
  const signToken = (payload: any, privateKey: string, options: jwt.SignOptions) => {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, privateKey, options, (error, token) => {
        if (error) throw reject(error)
        resolve(token as string)
      })
    })
  }
  ```

- khi mà mình tạo ra `access-token` hay `refresh-token` thì mình cũng cần phải có 1 `private key` để xác nhận mình là `chủ của server`, nếu không thì có thể xảy ra trường hợp 1 hacker nào đó tấn công vào server của mình và tự tạo 1 `access-token`

  - nên là giờ mình sẽ vào `.env` tạo 1

    ```ts
        JWT_SECRET = '123!@#' và thêm thời gian hết hạn
        `#nếu expire_in là số thì nó sẽ tính theo giây, nếu là string thì nó sẽ tính theo phút, giờ, ngày, tháng, năm
        ACCESS_TOKEN_EXPIRE_IN = '15m'
        REFRESH_TOKEN_EXPIRE_IN = '100d'
    ```

  - trong `jwt.ts` ta gán default parameter cho `privateKey` là `JWT_SECRET`

    ```ts
    import jwt from 'jsonwebtoken'
    //privateKey là password để được quyền tạo chữ ký jwt
    const signToken = (payload: any, privateKey = process.env.JWT_SECRET as string, options: jwt.SignOptions) => {
      return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, privateKey, options, (error, token) => {
          if (error) throw reject(error)
          resolve(token as string)
        })
      })
    }
    ```

  - nếu ta viết paramter như thế này thì khi mỗi lần gọi `signToken` sẽ phải truyền vào 3 giá trị theo thứ tự, vậy thì cái default parameter sẽ rất ngớ ngẫn, ta có thể đổi thứ tự và đưa privatekey ra sau cùng
  - thay vào đó ta sẽ thay chúng bằng object thì nếu truyền thiếu, hay sai thứ tự đều không sao cả

    ```ts
    export const signToken = ({
    payload,
    privateKey = process.env.JWT_SECRET as string,
    options = { algorithm: 'HS256' }
    }: {
    payload: string | object | Buffer
    privateKey?: string
    options?: jwt.SignOptions
    }) => {
    return new Promise<string>((resolve, reject) => {
        ...
    ```

    và ta sẽ xài hàm này trông như thế này, thiếu options cũng đc
    ![Alt text](./attachments/image-54.png)
    thay vì thế này
    ![Alt text](./attachments/image-53.png)

- giờ ta sẽ dùng `signToken` ở `users.services.ts` để tạo access-token và `refresh-token` gữi cho `client`
  `users.services.ts`

  - tạo enum để phân loại các dạng token, vào `enums.ts`, ta thêm

  ```ts
  export enum TokenType {
    AccessToken, //0
    RefreshToken, //1
    ForgotPasswordToken, //2
    EmailVerificationToken //3
  }
  ```

  - ở `users.services.ts` ta tạo hàm `signAccessToken` và `signRefreshToken` sử dụng `signToken` dùng để tạo ra access token cho 1 `user_id` nào đó

  ```ts
  class UsersService {
    private  signAccessToken(user_Id: string) {
        return  signToken({
            payload: { user_Id, token_type: TokenType.AccessToken },
            options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
        })
    }
    private  signRefreshToken(user_Id: string) {
        return  signToken({
            payload: { user_Id, token_type: TokenType.RefreshToken },
            options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
        })
    }

    async register(payload: RegisterReqBody) {
    ...
  ```

- trong `method register` ta sẽ code thêm hành động tạo `at` và `rt` và gữi cho client
  - khi `register` chạy thì `insertOne` chạy và gữi về `res` có dạng như sau
    ![Alt text](./attachments/image-55.png)
    trong đó `insertedId` là `user_Id` của user vừa được thêm vào
    khách hàng vừa tạo `account` thì ta dùng luôn `user_id` đó và tạo `access_token` trả cho họ luôn
  - nên ta sẽ code trong `register` như sau
    ```ts
    async register(payload: RegisterReqBody) {
        const result = await databaseService.users.insertOne(
            new User({
                ...payload,
                date_of_birth: new Date(payload.date_of_birth),
                password: hashPassword(payload.password)
            })
        )
        //insertOne sẽ trả về 1 object, trong đó có thuộc tính insertedId là user_Id của user vừa tạo
        //vì vậy ta sẽ lấy user_Id đó ra để tạo token
        const user_Id = result.insertedId.toString()
        // const accessToken = await this.signAccessToken(user_Id)
        // const refreshToken = await this.signRefreshToken(user_Id)
        //nên viết là thì sẽ giảm thời gian chờ 2 cái này tạo ra
        const [accessToken, refreshToken] = await Promise.all([
        this.signAccessToken(user_Id),
        this.signRefreshToken(user_Id)
        ]) //đây cũng chính là lý do mình chọn xử lý bất đồng bộ, thay vì chọn xử lý đồng bộ
        //Promise.all giúp nó chạy bất đồng bộ, chạy song song nhau, giảm thời gian
        return { accessToken, refreshToken }
        //ta sẽ return 2 cái này về cho client
        //thay vì return user_Id về cho client
    }
    ```
- test kết quả
  ![Alt text](./attachments/image-56.png)
  ta có thể test thử xem at và rt đó mã hóa ra gì bằng trang jwt.io
  ![Alt text](./attachments/image-57.png)
  `iat` là thời gian tạo
  `exp` là thời gian hết hạn
