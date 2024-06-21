export interface TgWebAppDataUserJson {
    id: number,
    first_name: string,
    last_name: string,
    username: string,
    language_code: string,
    is_premium: boolean,
    allows_write_to_pm: boolean,
}

export interface TgWebAppDataJson {
    query_id: string,
    auth_date: string,
    hash: string,
    user: TgWebAppDataUserJson,
}
