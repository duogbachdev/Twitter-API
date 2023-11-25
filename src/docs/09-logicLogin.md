# xử lý chức năng login

- ta sẽ tiến hành tân trang lại cho route của login

```ts
/*
des: đăng nhập
path: /users/register
method: POST
body: {email, password}
*/
usersRouter.post('/login', loginValidator, loginController)
```

- bắt đầu với `loginValidator`, ta sẽ tạo check dữ liệu người dùng truyền lên gồm `email và password`, nên ta cũng sẽ dùng `validate` như `register`, ta có thể tái sử dụng lại cái `email` và `password` của `registerValidator`

```ts
export const loginValidator = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await usersService.checkEmailExist(value)
          if (isExistEmail) {
            throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 8,
          max: 50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    }
  })
)
```

- khi đăng nhập thành công thì phải gữi access token và refresh token về cho client, nhưng muốn tạo ra 2 cái đó thì ta phải có `user_id` để tạo ra
- khi mà ta `login`(ta chỉ nhập `email` và `password`) thì `user_id` lấy từ đâu ?
  trong `table users` vẫn sẽ có `_id` chính là `user_id`, khi mà ta nhập vào `email` và `password`
  nếu có `email` tồn tại thì ta sẽ tìm đc `user` tương ứng, vậy nên flow sẽ là

  - người dùng nhập `email, password`
  - `loginValidator` sẽ `kiểm tra email có tồn tại không`, đồng thời `nếu có thì lưu lại user` tìm được vào `req` luôn
  - `loginController` sẽ mở `req.user` và lấy `user_id` phục vụ cho việc kiểm tra đăng nhập ở tầng `database`

- vậy nên ta sẽ chính lại `loginValidator> đoạn email`

  ```ts
  custom: {
    options: async (value, { req }) => {
      const user = await databaseService.users.findOne({
        email: value,
        password: hashPassword(req.body.password)
      })

      if (user === null) {
        throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
      }
      req.user = user // lưu user vào req để dùng ở loginController
      return true
    }
  }
  ```

- fix lại `loginController`

  ```ts
  export const loginController = async (req: Request, res: Response) => {
    const { user }: any = req // lấy user từ req
    const user_id = user._id // lấy _id từ user
    const result = await usersService.login(user_id.toString())
    //login nhận vào user_id:string, nhưng user_id ta có
    //là objectid trên mongodb, nên phải toString()
    //trả ra kết quả, thiếu cái này là sending hoài luôn
    return res.json({
      message: 'Login success',
      result: result
    })
  }
  ```

  - ở `users.routes.ts` bọc `loginController` vào `wrapAsync` vì `loginController` là async await nhưng k dùng `try catch`

  ```ts
  usersRouter.post('/login', loginValidator, wrapAsync(loginController))
  ```

  - trong `loginController` chắc chắn ta sẽ dụng vào database tức là services, nên ta phải chuẩn bị bên `users.services.ts`, ta sẽ chỉnh sữa và tối ưu như sau:

  - đoạn code tạo ra `ac` và `rf` này của `method register` sẽ xuất hiện rất nhiều lần(khi ta `đăng nhập`, khi ta `đăng ký`) nên ta sẽ tách nó ra method riêng để tái sử dụng

    ```ts
    //đoạn trong register cần bị tách
    const [access_token, refresh_token] = await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])

    //đem ra ngoài và viết thành method riêng
    private signAccessAndRefreshToken(user_id: string) {
      return Promise.all([
        this.signAccessToken(user_id),
        this.signRefreshToken(user_id)
      ])
    }

    //và cuối cùng register sẽ thành
    async register(payload: RegisterReqBody) {
      const result = await databaseService.users.insertOne(
        new User({
          ...payload,
          date_of_birth: new Date(payload.date_of_birth),
          password: hashPassword(payload.password)
        })
      )

      const user_id = result.insertedId.toString()
      //xài ở đây
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
      return { access_token, refresh_token }
    }
    ```

  - giờ ta tạo method login nhận vào user_id và sign ac và rf

    ```ts
    async login(user_id: string) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
      return { access_token, refresh_token }
    }
    ```

  - test code:
    - đăng ký tài khoản
      ![Alt text](./attachments/image-78.png)
    - tạo request login : và nhập đúng password
      ![Alt text](./attachments/image-79.png)
    - tạo request login : và nhập sai password
      ![Alt text](./attachments/image-80.png)

- có một điều thú vị là

  một lỗi đc tạo ra bằng new Error tuy có `message` nhưng sẽ đc xem là `{}`
  vì trong bộ cờ của nó `enumerable` là `false` (tức là sẽ k đc hiển thị)
  ![Alt text](./attachments/image-81.png)
  điều này dẫn đến việc, nếu ta throw lỗi thì sẽ bị crashed app ngay

  ```ts
  export const loginController = async (req: Request, res: Response) => {
    const { user }: any = req
    const user_id = user._id
    const result = await usersService.login(user_id.toString())
    throw new Error('tạo thử 1 cái lỗi nè')//ném thử
    ...
  }
  ```

  điều này chứng tỏ hệ thống xử lý lỗi của ta đã có vấn đề và vấn đề nằm ở `message` của dạng lỗi đó, nên ta sẽ đến nơi tập kết lỗi (`error.middlewares.ts`) và rào trước lỗi nhận vào như sau.

  ```ts
  export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    //err là lỗi từ các nơi khác truyền xuống, và ta đã quy ước lỗi phải là 1 object có 2 thuộc tính: status và message
    if (err instanceof ErrorWithStatus) {
      //nếu err là 1 instance của ErrorWithStatus
      //thì ta sẽ trả về status và message của err đó
      return res.status(err.status).json(omit(err, ['status']))
    }
    //Object.getOwnPropertyNames(err) trả về 1 mảng các key của err
    //forEach sẽ duyệt qua từng key
    Object.getOwnPropertyNames(err).forEach((key) => {
      //và ta sẽ cho các key của err về enumerable = true
      //để ta có thể lấy được các key đó
      Object.defineProperty(err, key, { enumerable: true })
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: err.message,
      // errorInfor: err //truyền vậy là truyền lên cả stack(full lỗi và đường dẫn của file lỗi)
      errorInfor: omit(err, ['stack']) //truyền vậy là chỉ truyền lên message
    })
  }
  ```

  test lại code:
  ![Alt text](./attachments/image-82.png)

  demo hoàn thành bỏ throw new Error trong `loginController`

- trong đoạn của `loginController` có khúc user any khá khó chịu, ta sẽ định dạng lại nó

  ```ts
  export const loginController = async (req: Request, res: Response) => {
    const { user }: any = req
  ```

  ta vào `type.d.ts` định dạng cho user trong các `request` như sau

  ```ts
  import User from './models/schemas/User.schema'
  import { Request } from 'express'
  declare module 'express' {
    interface Request {
      user?: User //thêm ? vì k phải request nào cũng có user
    }
  }
  ```

  loginCotroller nhờ vậy mà fix thành

  ```ts
  export const loginController = async (req: Request, res: Response) => {
    const user = req.user as User // lấy user từ req
    const user_id = user._id as ObjectId // lấy _id từ user
    const result = await usersService.login(user_id.toString())

    return res.status(400).json({
      message: 'Login success',
      result: result
    })
  }
  ```

  thêm `message.ts`

  ```ts
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success'
  ```

  trong `users.controllers.ts` đổi các message của res tương ứng

  ```ts
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result: result
  })

  //và
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result: result
  })
  ```

  test lại postman:
  ![Alt text](./attachments/image-83.png)

- khi mà ta đăng ký hay tạo tài khoản thì ta sẽ tạo ra 1 `rf token`
- ta phải lưu `rf token` vào trong `database`, để khi nào cần refresh thì ta sẽ so sánh `rf của người dùng` có và ta để cấp `at` cho họ

  - trong `models/schemas` ta tạo `RefreshToken.schema.ts` và ta sẽ tạo schema theo thiết kế ban đầu của bài [csdlDOC](./../ch03-csdl/csdlDoc.md)

    ```ts
    //bản thiết kế nè
    interface RefreshToken {
      _id: ObjectId
      token: string
      created_at: Date
      user_id: ObjectId
    }
    ```

    `RefreshToken.schema.ts` nè

    ```ts
    import { ObjectId } from 'mongodb'
    //interface dùng để định nghĩa kiểu dữ liệu
    //interface không có thể dùng để tạo ra đối tượng
    interface RefreshTokenType {
      _id?: ObjectId //khi tạo cũng k cần
      token: string
      created_at?: Date // k có cũng đc, khi tạo object thì ta sẽ new Date() sau
      user_id: ObjectId
    }
    //class dùng để tạo ra đối tượng
    //class sẽ thông qua interface
    //thứ tự dùng như sau
    //class này < databse < service < controller < route < app.ts < server.ts < index.ts

    export default class RefreshToken {
      _id?: ObjectId //khi client gửi lên thì không cần truyền _id
      token: string
      created_at: Date
      user_id: ObjectId
      constructor({ _id, token, created_at, user_id }: RefreshTokenType) {
        this._id = _id
        this.token = token
        this.created_at = created_at || new Date()
        this.user_id = user_id
      }
    }
    ```

  - vào `.env` tạo tên cho `collection refresh_tokens`(giống đang tạo table trong sql), trong `.env` thêm
    ```ts
    DB_REFRESH_TOKENS_COLLECTION = 'refresh_tokens'
    ```
  - vào `database.services.ts` dùng `DB_REFRESH_TOKENS_COLLECTION` viết method tạo || lấy collection `refresh_tokens`
    ```ts
    class DatabaseService {
      ...
      //method này trả về 1 collection chứa các object RefreshToken
      //RefreshToken là class mà ta đã tạo trước đó
      get refreshTokens(): Collection<RefreshToken> {
        return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string) // users là tên của collection
      }
      ...
    }
    ```
  - vào `users.servives.ts` đoạn `class UsersService > register`, sao khi tạo ra `at` và `rft`, ta sẽ lưu rf vào trong collection mới tạo, rồi mới return

    ```ts
    class UsersService {
      ...
      async register(payload: RegisterReqBody) {
        ...
        //lưu lại refreshToken và collection refreshTokens mới tạo
        await databaseService.refreshTokens.insertOne(
          new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
        )
        //user_id ta có là string, mà trong database thì user_id là ObjectId
        //nên ta không truyền là user_id: user_id, mà là user_id: new ObjectId(user_id)
        return { access_token, refresh_token }
      }
      ...
      //tương tự với login
      async login(user_id: string) {
        ...
        //đổi lại tên cho chuẩn khi trả về
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
        await databaseService.refreshTokens.insertOne(
          new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
        )
        return { access_token, refresh_token }
      }

    }
    ```

    test thử:
    ![Alt text](./attachments/image-85.png)
    ![Alt text](./attachments/image-84.png)

  - một lưu ý nhỏ là các chỗ ta xài biến môi trường `process.env`
    thì nên chạy lệnh `config()` để import, đó là ta k bị lỗi là vì ta may mắn đã xài các method khác có config sẵn trong lúc xài `process.env` nên ta thêm `config()`, ta có thể dùng công cụ tìm kiếm để tìm các file thiếu đó hoặc cụ thể là các file `jwt.ts , crypto.ts, user.services.ts, database.service.ts`(thường tự có) sau đó thêm
    ```ts
    import { config } from 'dotenv'
    config()
    ```
