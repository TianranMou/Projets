# User Control API Doucment



## 1. get user's info

- **URL**: `/statis.php`
- **method**: `GET`
- **(key)action**: `userinfo`
- **response**: return a json contain all infos


## 2. create new user

- **URL**: `/register.php`
- **method**: `POST`
- **Request body**:
    ```json
    {
        "NAME": "name",
        "EMAIL": "email",
        ```
    }
    ```

## 3.  edit user

- **URL**: `/statis.php`
- **method**: `PUT`
- **request body**:
    ```json
    {
        "Name" : "newname"
    }
    ```
- **response**:
    - when succeed return `200 OK`。
    - cant find the user with input id `404 Not Found`。


## 1. get user's meal info

- **URL**: `/getmeal.php`
- **method**: `GET`
- **(key)action**: `userinfo`
- **response**: return a json contain all infos


## 2. create new meal

- **URL**: `/meal.php`
- **method**: `POST`
- **Request body**:
    ```json
    {
        "FOOD_NAME": "name",
        "QUANTITY": "email",
        ```
    }
    ```

## 3.  edit meal

- **URL**: `/meal.php`
- **method**: `PUT`
- **request body**:
    ```json
    {
        "Name" : "newname"
        ```
    }
    ```
- **response**:
    - when succeed return `200 OK`。
    - cant find the user with input id `404 Not Found`。

## 4. delete meal

- **URL**: `/meal.php`
- **method**: `DELETE`
- **request body**:
    ```json
    {
        "id": "ID"
    }
    ```
- **response**:
    - when succed return `204 No Content`。
    - cant find the user with input id `404 Not Found`。

