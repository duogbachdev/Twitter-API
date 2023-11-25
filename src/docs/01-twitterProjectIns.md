# xây dựng ứng dụng Twitter

# I . setup môi trường nodejs project

## **Tạo folder ch04-twitterProject**

ta sẽ setup môi trường nodejs project + ts như trong **02-NodejsTS(Ch02)** mà mình đã học

**_nội dung bài trước_**

### tiến hành cài đặt nodejs + ts + eslint + prettier

bật terminal

```bash
npm init -y --tạo package.json
npm i typescript -D --vì nó chỉ dùng để làm , chứ sản phẩm vẫn là js
npm i @types/node -D -thêm kiểu ts cho thằng nodejs hiểu
npm install eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser ts-node tsc-alias tsconfig-paths rimraf nodemon -D

```

**eslint**: Linter (bộ kiểm tra lỗi) chính
**prettier**: Code formatter chính
**eslint-config-prettier**: Cấu hình ESLint để không bị xung đột với Prettier
**eslint-plugin-prettier**: Dùng thêm một số rule prettier cho eslint
**@typescript-eslint/eslint-plugin**: ESLint plugin cung cấp các rule cho Typescript
**@typescript-eslint/parser**: Parser cho phép ESLint kiểm tra lỗi Typescript
**ts-node**: Dùng để chạy TypeScript code trực tiếp mà không cần build
**tsc-alias**: Xử lý alias khi build
**tsconfig-paths**: Khi setting alias import trong dự án dùng ts-node thì chúng ta cần dùng tsconfig-paths để nó hiểu được paths và baseUrl trong file tsconfig.json
**rimraf**: Dùng để xóa folder dist khi trước khi build
**nodemon**: Dùng để tự động restart server khi có sự thay đổi trong code

### cấu hình ts bằng file tsconfig.json

tạo cùng cấp với package.json

```bash
touch tsconfig.json
```

thêm vào tsconfig.json nội dung sau

```json
{
  "compilerOptions": {
    "module": "CommonJS", // Quy định output module được sử dụng
    "moduleResolution": "node", //
    "target": "ES2020", // Target ouput cho code
    "outDir": "dist", // Đường dẫn output cho thư mục build
    "esModuleInterop": true /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */,
    "strict": true /* Enable all strict type-checking options. */,
    "skipLibCheck": true /* Skip type checking all .d.ts files. */,
    "baseUrl": ".", // Đường dẫn base cho các import
    "paths": {
      "~/*": ["src/*"] // Đường dẫn tương đối cho các import (alias)
    }
  },
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  },
  "files": ["src/type.d.ts"], // Các file dùng để defined global type cho dự án
  "include": ["src/**/*"] // Đường dẫn include cho các file cần build
}
```

### cấu hình eslint bằng file .eslintrc

cài extensions eslint
tạo file .eslintrc

```bash
touch .eslintrc
```

nội dung

```js
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "eslint-config-prettier", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prettier/prettier": [
      "warn",
      {
        "arrowParens": "always",
        "semi": false,
        "trailingComma": "none",
        "tabWidth": 2,
        "endOfLine": "auto",
        "useTabs": false,
        "singleQuote": true,
        "printWidth": 120,
        "jsxSingleQuote": true
      }
    ]
  }
}

```

cài thêm .eslintignore để loại bỏ những file mà mình không muốn nó format code của mình

tạo file .eslintignore

```bash
touch .eslintignore
```

nội dung

```js
node_modules/
dist/
```

nghĩa là nếu có kiểm tra và fix format code thì k đụng vào các thư mục trên

### cấu hình cho prettier tự canh chỉnh lề cho đẹp

cài extensions prettier
tạo file .prettierrc để cấu hình

```bash
touch .prettierrc
```

nội dung .prettierrc là

```js
{
  "arrowParens": "always",
  "semi": false,
  "trailingComma": "none",
  "tabWidth": 2,
  "endOfLine": "auto",
  "useTabs": false,
  "singleQuote": true,
  "printWidth": 120,
  "jsxSingleQuote": true
}

```

cài thêm file .prettierignore để nó k canh lề cho những cái mình k thích

```bash
touch .prettierignore
```

nội dung .prettierignore là

```js
node_modules/
dist/
```

### editor để chuẩn hóa khi code

cài extensions EditorConfig for VS Code
tạo file .editorconfig

```bash
touch .editorconfig
```

nội dung .editorconfig

```js
indent_size = 2
indent_style = space
```

### thêm .gitignore

để tránh push những thứ k cần thiết lên git
tạo file .gitignore

```bash
touch .gitignore
```

mọi người vào trang này [link](https://www.toptal.com/developers/gitignore)
tìm nodejs

và chép nội dung đó vào file

### cấu hình nodemon.json

tạo file nodemon.json

```bash
touch nodemon.json
```

nội dung

```json
{
  "watch": ["src"],
  "ext": ".ts,.js", //trecking các file có ts và js
  "ignore": [], //liệt kê file nào mà bạn k thích theo dõi vào
  "exec": "npx ts-node ./src/index.ts" //chạy file index
}
```

### cấu hình package.json

vào file package.json
thay script thành

```json
  "scripts": {
    "dev": "npx nodemon", //dùng để code
    "build": "rimraf ./dist && tsc && tsc-alias",//code xong build ra sản phẩm
    "start": "node dist/index.js", //run code vừa build, phải build trước
    "lint": "eslint .", //kiểm tra rỗi
    "lint:fix": "eslint . --fix",//fix lỗi
    "prettier": "prettier --check .",
    "prettier:fix": "prettier --write ."
  }

```

### tạo type.d.ts

tạo thư mục src
tạo thư mục src và tạo file type.d.ts

```bash
touch type.d.ts
```

type.d.ts là file giúp mình định nghĩa các kiểu dữ liệu của biến trong khi code ts
ta sẽ học nó sau nay
nếu mà file tsconfig bị lỗi, có thể là do nó bị lag
ta phải vào file tsconfig ctrl + shift + p gõ **restart ts server**

# II . Kiểm tra project vừa setup và cài đặt môi trường server routing với expressjs

```bash
npm run dev
```

kiểm tra xem code trong **index.ts** có hoạt động không
sau đó ta sẽ tiến hành **xóa hết code** trong **index.ts**, và code những cái liên quan đến expressjs

cài đặt expressjs phiên bản cho ts

```bash
npm i express
npm i @types/express -D //dành cho ts
```

file index.ts

```ts
import express from 'express'
const app = express()
const port = 3000
app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
```

mở postMan và setting bộ test api cho dự án
tạo collection mới đặt tên **Twitter-API-Project**
tạo 1 folder để lưu những gì liên quan đến **_User_**
tạo 1 cái api test để xem cái routing '/' của mình có hoạt động không
'http://localhost:3000/'
![Alt text](./attachments/image.png)

ta send thì sẽ nhận được 'hello world'

## express.Router

trên thực tế app.get chỉ dành cho các routing tổng mà thôi
nếu ta cần chia nhỏ các bộ routing như dự án của mình ta phải **express.Router**

**middleware**: là 1 tác vụ được chạy trước khi thực hiện các tác vụ khác
![Alt text](./attachments/./attachments/image-1.png)
_hình trên doc của express_

- khi mà /about chạy hay / chạy thì middleware chạy trước đến khi `next()`
  thì nó mới cho thằng tác vụ about chạy

ta sẽ cài đặt một router vào dự án của mình
trong index.ts ta khai báo thêm

```ts
const usersRouter = express.Router() //khai báo Router

//viết  1 route giúp get data /tweets
usersRouter.get('/tweets', (req, res) => {
  res.json({
    data: [
      { fname: 'Điệp', yob: 1999 },
      { fname: 'Hùng', yob: 2003 },
      { fname: 'Được', yob: 1994 }
    ]
  })
})
app.use('/api', usersRouter)
//app tổng sẽ dùng usersRouter trên nên ta sẽ có 1 đường dẫn là /api/tweets
//nên lúc muốn xài api tweets thì ta phải truy cập bằng
//localhost:3000/api/tweets
```

![Alt text](./attachments/image-2.png)

trong `index.ts`
phía trên `usersRouter ./tweets` ta thêm cái middleware(ngta hay còn gọi là handler) để mỗi lần mình dùng `route nào của usersRouter` thì nó sẽ chạy `middleware` của `usersRouter` trước

```ts
//usersRouter sử dụng 1 middleware
usersRouter.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})
```

thử bật tắt next và test post main xem có điều gì xảy ra hông ?
_nếu tắt next thì các hàm dưới sẽ không chạy_

### ta có thể có rất nhiều middleware

- trong `index.ts` ta thêm 1 tý phần `middleware`

```ts
//trước khi chạy các route của usersRouter thì nó sẽ chạy các middleware này trước
usersRouter.use(
  (req, res, next) => {
    console.log('Time: ', Date.now())
    next()
  },
  (req, res, next) => {
    console.log('Time2: ', Date.now())
    next()
  }
)
```

- giả sử ta xóa 1 next và thêm 1 cái status lỗi chẳng hạn

```ts
usersRouter.use(
  (req, res, next) => {
    console.log('Time: ', Date.now())
    // next()
    res.status(400).send('not allowed')
    console.log(12345) //đoạn code này vẫn chạy, chỉ là server thấy, còn client k nhận đc
  },
  (req, res, next) => {
    console.log('Time2: ', Date.now())
    next()
  }
)
```

vậy thì nó sẽ trả ra `status 400` và thông báo lỗi, đồng thời k cho ta chạy cái middleware bên dưới
![Alt text](./attachments/image-3.png)
![Alt text](./attachments/image-4.png)

### tách phần usersRouter ra 1 file riêng cho tiện quản lý

tạo 1 file `users.routers.ts` trong `src`

từ 1 file `index.ts` ta tách ra thành 2 file sau
trong `users.routers.ts`

```ts
//khai báo
import { Router } from 'express'
const usersRouter = Router()
//middleware
usersRouter.use(
  (req, res, next) => {
    console.log('Time: ', Date.now())
    next()
    // res.status(400).send('not allowed')
    // console.log(12345)
  },
  (req, res, next) => {
    console.log('Time 2: ', Date.now())
    next()
  }
)
//router
usersRouter.get('/tweets', (req, res) => {
  res.json({
    data: [
      { fname: 'Điệp', yob: 1999 },
      { fname: 'Hùng', yob: 2003 },
      { fname: 'Được', yob: 1994 }
    ]
  })
})
export default usersRouter
```

và trong file `index.ts` ta fix

```ts
import express from 'express'
const app = express()
import usersRouter from './users.routes'
const port = 3000

app.get('/', (req, res) => {
  res.send('hello world')
})

//fix lại thành user luôn cho dỡ hack não
//nên api lúc này là http://localhost:3000/user/tweets
app.use('/user', usersRouter) //route handler
app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
```

test lại xem thử có lỗi lầm gì hông

## III - Cấu trúc thư mục của dự án

cấu trúc dự án
📦nodejs-typescript
┣ 📂dist
┣ 📂src
┃ ┣ 📂constants
┃ ┃ ┣ 📜enum.ts
┃ ┃ ┣ 📜httpStatus.ts
┃ ┃ ┗ 📜message.ts
┃ ┣ 📂controllers (bộ điều khiển xử lý logic ứng dụng)
┃ ┃ ┗ 📜users.controllers.ts (xử lý logic router users)
┃ ┣ 📂middlewares
┃ ┃ ┣ 📜error.middlewares.ts
┃ ┃ ┣ 📜file.middlewares.ts
┃ ┃ ┣ 📜users.middlewares.ts
┃ ┃ ┗ 📜validation.middlewares.ts
┃ ┣ 📂models
┃ ┃ ┣ 📂database (kiểu dữ liệu cho các Collection tương ứng)
┃ ┃ ┃ ┣ 📜Blacklist.ts
┃ ┃ ┃ ┣ 📜Bookmark.ts
┃ ┃ ┃ ┣ 📜Follower.ts
┃ ┃ ┃ ┣ 📜Hashtag.ts
┃ ┃ ┃ ┣ 📜Like.ts
┃ ┃ ┃ ┣ 📜Media.ts
┃ ┃ ┃ ┣ 📜Tweet.ts
┃ ┃ ┃ ┗ 📜User.ts
┃ ┃ ┣ 📜Error.ts
┃ ┃ ┗ 📜Success.ts
┃ ┣ 📂routes
┃ ┃ ┗ 📜users.routes.ts
┃ ┣ 📂services (nơi xử lý những câu lệnh query - thằng controller sẽ gọi services)
┃ ┃ ┣ 📜bookmarks.services.ts
┃ ┃ ┣ 📜database.services.ts
┃ ┃ ┣ 📜followers.services.ts
┃ ┃ ┣ 📜hashtags.services.ts
┃ ┃ ┣ 📜likes.services.ts
┃ ┃ ┣ 📜medias.services.ts
┃ ┃ ┣ 📜tweets.services.ts
┃ ┃ ┗ 📜users.services.ts
┃ ┣ 📂utils(hàm tiện ích)
┃ ┃ ┣ 📜crypto.ts
┃ ┃ ┣ 📜email.ts
┃ ┃ ┣ 📜file.ts
┃ ┃ ┣ 📜helpers.ts
┃ ┃ ┗ 📜jwt.ts
┃ ┣ 📜index.ts
┃ ┗ 📜type.d.ts
┣ 📜.editorconfig
┣ 📜.env
┣ 📜.eslintignore
┣ 📜.eslintrc
┣ 📜.gitignore
┣ 📜.prettierignore
┣ 📜.prettierrc
┣ 📜nodemon.json
┣ 📜package.json
┣ 📜tsconfig.json
┗ 📜yarn.lock
Giải thích các thư mục:

dist: Thư mục chứa các file build
src: Thư mục chứa mã nguồn
src/constants: Chứa các file chứa các hằng số
src/middlewares: Chứa các file chứa các hàm xử lý middleware, như validate, check token, sanitize(lọc dữ liệu vd: ngta gữi 10 file, mình lọc lấy 2 file cho lên server thôi )
src/controllers: Chứa các file nhận request, gọi đến service để xử lý logic nghiệp vụ, trả về response
src/services: Chứa các file chứa method gọi đến database để xử lý logic nghiệp vụ
src/models: Chứa các file chứa các model
src/routes: Chứa các file chứa các route
src/utils: Chứa các file chứa các hàm tiện ích, như mã hóa, gửi email, ...
Còn lại là những file config cho project như .eslintrc, .prettierrc, ... mình sẽ giới thiệu ở bên dưới

## Demo tổ chức thự mục

- tạo trong **src** tạo 7 folder sau: **constants**, **controllers**, **middlewares**, **services**, **routes**, **utils**, **models**

- ta nhét file `users.routes.ts` vào thư mục **routes**

- fix lại đường dẫn cho file index đoạn `import usersRouter from './routes/users.routes'` và `app.use('/users', usersRouter)`

- tách phần middlewares ra khỏi file `users.routes.ts`

  - tạo trong middlewares file `users.middlewares.ts`
  - demo tạo 1 middlewares phục vụ kiểm tra login cho users
    đoạn code trong file `users.middlewares.ts` như sau

    ```ts
    ///import các interface để định dạng kiểu cho para của middlewares
    import { Request, Response, NextFunction } from 'express'

    //1 req của client gữi lên server sẽ có body(chứa các thứ cẫn gữi)
    export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
      // ta vào body lấy email, password ra
      console.log(req.body) //log xem có gì
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({
          error: 'Missing email or password'
        })
      }
      next()
    }
    ```

  - vào file `users.routes.ts`

    ```ts
    //khai báo
    import { Router } from 'express'
    const usersRouter = Router()

    usersRouter.post('/login', (req, res) => {
      res.json({
        data: [
          { fname: 'Điệp', yob: 1999 },
          { fname: 'Hùng', yob: 2003 },
          { fname: 'Được', yob: 1994 }
        ]
      })
    })

    export default usersRouter
    ```

  - test postman với routes vừa tạo, method là post, truyền data đầy đủ
    để ý type là json nhé
    ![Alt text](./attachments/image-8.png)
  - nếu data không đầy đủ thì nó vẫn sẽ lấy đc dữ liệu vì file route và file middlewares chưa liên kết gì vào nhau nên ta fix file `users.routes.ts` 1 tý

    ```ts
    import { loginValidator } from '~/middlewares/users.middlewares'
    usersRouter.post('/login', loginValidator, (req, res) => {
      res.json({
        //thay thành message cho đẹp
        message: [
          { fname: 'Điệp', yob: 1999 },
          { fname: 'Hùng', yob: 2003 },
          { fname: 'Được', yob: 1994 }
        ]
      })
    })
    ```

  - giờ ta test lại postman sẽ thấy lỗi `TypeError: Cannot destructure property 'email' of 'req.body' as it is undefined.` vì dữ liệu được truyền lên là json, ta nên cấu hình cho server khi nhận json thì sẽ tự parse bằng cách vào file **index.ts** thêm dòng này
    ```ts
    app.use(express.json()) //app handler
    ```

- tách controller

  - trong `users.routes.ts` đoạn

    ```ts
    usersRouter.post('/login', loginValidator, (req, res) => {
      res.json({
        //thay thành message cho đẹp
        message: [
          { fname: 'Điệp', yob: 1999 },
          { fname: 'Hùng', yob: 2003 },
          { fname: 'Được', yob: 1994 }
        ]
      })
    })
    ```

    phần hàm là controller , ta sẽ tách nó ra làm 1 file riêng và cất vào folder controller

  - tạo file `users.controllers.ts` trong **controller** nội dung

    ```ts
    import { Request, Response } from 'express'
    export const loginController = (req: Request, res: Response) => {
      const { email, password } = req.body
      if (email === 'lehodiep.1999@gmail.com' && password === '123123123') {
        return res.json({
          data: [
            { fname: 'Điệp', yob: 1999 },
            { fname: 'Hùng', yob: 2003 },
            { fname: 'Được', yob: 1994 }
          ]
        })
      } else {
        return res.status(400).json({
          error: 'login failed'
        })
      }
    }
    ```

  - file `users.routes.ts` fix thành

    ```ts
    import { loginController } from '~/controllers/users.controllers'
    usersRouter.post('/login', loginValidator, loginController)
    ```

    và kiểm tra qua postman

  - tóm lại mô hình đầy đủ sẽ như thế này
    ![Alt text](./attachments/image-10.png)

quy trình ![Alt text](./attachments/image-6.png)
app handler > route handler gồm: middleware > controller > service > trả ra kết quả

# IV - kết nối mongo Atlas bằng MongoDB Driver

- mình sẽ dùng mongoDB( tên đầy đủ là mongoDB Nodejs Driver) để kết nối mongo với dự án của mình, đây là 1 thư viện chính thức của mongo
  (những lựa chọn khác như mongoes, prisma)

- tạo csdl cho dự án twitter

  - vào mongo tạo 1 Projects mới
    ![Alt text](./attachments/image-11.png)

  - tại một clutter mới
    ![Alt text](./attachments/image-12.png)
    ![Alt text](./attachments/image-13.png)

  - tạo 1 database tên `twitter-dev` và collection `users`
    ![Alt text](./attachments/image-14.png)

## 1 - Connect mongo với compass

- vào task `overview > connect > compass` và làm theo các bước cài đặt
  ![Alt text](./attachments/image-16.png)

- copy đường dẫn và chèn vào app mongo compass để kết nối
  mongodb+srv://lehodiep1999:<password>@twitter.zhww2g8.mongodb.net/
  ![Alt text](./attachments/image-17.png)

- kết quả ta có
  ![Alt text](./attachments/image-18.png)

## 2 - Connect mongo với nodejs

- vào task `overview > connect > driver` và làm theo các bước cài đặt
  ![Alt text](./attachments/image-15.png)

- ```bash
  npm i mongodb
  ```
- copy phần code connect mẫu
  ![Alt text](./attachments/image-19.png)

- vì liên quan đến database nên ta sẽ tạo 1 file tên `database.services.ts` trong services
- thay thế cú pháp required bằng import, và cung cấp password cho đường link
- file `database.services.ts` sẽ thế này

  ```ts
  //xóa bớt mấy cái k dùng
  import { MongoClient } from 'mongodb'
  const uri = 'mongodb+srv://lehodiep1999:lehodiep123123@twitter.zhww2g8.mongodb.net/?retryWrites=true&w=majority'

  const client = new MongoClient(uri)

  export async function run() {
    try {
      // kết nối mình với server mongo	(optional từ phiên bản 4.7 nên mình xóa đi cũng oke)
      // await client.connect()
      // gữi tính hiệu kết nối lên server
      await client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    }
  }
  ```

- chuẩn bị file xong thì ta sẽ vào file server của mình (`index.ts`) để xài hàm run bên `database.services.ts`

  - bên file `index.ts` ta thêm

  ```ts
  import { run } from './services/database.services'
  run().catch(console.dir)
  //run().catch(console.log(dir)) tương tự
  ```

  - chạy thử

  ```bash
  npm run dev
  ```

- chuyển đổi file `database.services.ts` về thành class

  ```ts
  import { MongoClient } from 'mongodb'
  const uri = 'mongodb+srv://lehodiep1999:lehodiep123123@twitter.zhww2g8.mongodb.net/?retryWrites=true&w=majority'

  class DatabaseService {
    private client: MongoClient
    constructor() {
      this.client = new MongoClient(uri)
    }
    async connect() {
      try {
        // kết nối mình với server mongo	(optional từ phiên bản 4.7 nên mình xóa đi cũng oke)
        // await client.connect()
        // gữi tính hiệu kết nối lên server
        await this.client.db('admin').command({ ping: 1 })
        console.log('Pinged your deployment. You successfully connected to MongoDB!')
      } catch (error) {
        console.log(error)
        throw error
      } // finally {
      // Ensures that the client will close when you finish/error
      //await this.client.close()
      //} // k dùng finally vì như vậy sau khi kết nối nó sẽ đóng lại luôn,
      //và mình sẽ k thể gữi request đc nữa
    }
  }

  //từ class tạo object và export nó ra ngoài
  const databaseService = new DatabaseService()
  export default databaseService
  ```

  - fix lại cách xài bên `index.ts`

  ```ts
  import databaseService from './services/database.services'
  databaseService.connect()
  ```

- trên thực tế người ta thường tách url này thành các biến để để dàng tương thích với nhiều database khác nhau, các biến được tách ra và lưu vào file `.env`, nên giờ sẽ tạo file `.env` ở lớp ngoài cùng của dự án và tiến hành
  tách url `const uri = 'mongodb+srv://lehodiep1999:lehodiep123123@twitter.zhww2g8.mongodb.net/?retryWrites=true&w=majority'`

  - file `.env`

  ```ts
  DB_USERNAME = 'lehodiep1999'
  DB_PASSWORD = 'lehodiep123123'
  ```

  -cài thêm thư viện `npm i dotenv`

  - file `database.services.ts` ta fix thành

  ```ts
  import dotenv from 'dotenv'
  dotenv.config()

  //console.log(process.env.DB_USERNAME) // lúc này thì dòng lệnh này sẽ chạy đc
  const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.zhww2g8.mongodb.net/?retryWrites=true&w=majority`
  ```

- sau này push code lên dừng push file `.env` nha, vì nó chứa toàn thông tin password quan trọng
