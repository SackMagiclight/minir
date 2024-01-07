export interface IMinIRSongEntity {
    songhash: string
    artist?: string
    bpm: number
    datetime: string
    genre?: string
    judgerank: number
    level: number
    maxbpm: number
    minbpm: number
    mode: string
    notes: number
    title: string
    total: number
    lnmode?: number
    video?: {
        videoid: string
        updateUserId: string
    }
}

export interface IMinIRScoreEntity {
    clear: number
    combo: number
    datetime: string
    egr: number
    epg: number
    lgr: number
    lpg: number
    notes: number
    avgjudge: number
    novalidate: boolean
    score: number
    songhash: string
    userid: string
    username?: string
    type: string
    beatorajaVer?: string
    skinName?: string
}

export interface IMinIRCourceEntity {
    courcehash: string
    datetime: string
    name: string
    status: string
    songs: {
        title: string
        songhash: string
    }[]
    constraints: string[]
}

export type SignupRequestDto = {
    username: string
    email: string
    password: string
}

export type AuthenticateRequestDto = {
    email: string
    password: string
}

export type AuthRequestDto = {
    accessToken: string
    refreshToken: string
}

export interface IMinIRUserEntity {
    userid: string
    bio: string
    datetime: string
    contest?: string[]
    rivals?: string[]
    publickey?: string
    services?: string[]
}

export type UpdateDynamoUserRequestDto = {
    bio: string
} & AuthRequestDto

export type AddRivalRequestDto = {
    rivalId: string
} & AuthRequestDto

export type RemoveRivalRequestDto = {
    rivalId: string
} & AuthRequestDto

export type AddServiceRequestDto = {
    token: string
} & AuthRequestDto