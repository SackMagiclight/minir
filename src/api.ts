import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
    AddRivalRequestDto,
    AddServiceRequestDto,
    AuthRequestDto,
    AuthenticateRequestDto,
    IMinIRCourceEntity,
    IMinIRScoreEntity,
    IMinIRSongEntity,
    IMinIRUserEntity,
    RemoveRivalRequestDto,
    SignupRequestDto,
    UpdateDynamoUserRequestDto,
} from './entities'

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://dpvj7h4ns4bkvqowuxu2zxpwpy0nrxly.lambda-url.us-east-1.on.aws/',
        responseHandler: 'content-type',
    }),
    endpoints: (builder) => ({
        getSongLatest: builder.query<IMinIRSongEntity[], { mode: string; count: number }>({
            query: (arg) => {
                const { mode, count } = arg
                return {
                    url: `song/latest`,
                    method: 'GET',
                    params: { mode, count },
                }
            },
        }),
        getSongScore: builder.query<
            {
                message: string
                songData: IMinIRSongEntity
                IRDatas: IMinIRScoreEntity
            },
            { songhash: string; userid: string }
        >({
            query: (arg) => {
                const { songhash, userid } = arg
                return {
                    url: `song/score`,
                    method: 'GET',
                    params: { songhash, userid },
                }
            },
        }),
        getSongScoreList: builder.query<
            {
                message: string
                songData: IMinIRSongEntity
                IRDatas: IMinIRScoreEntity[]
            },
            { songhash: string }
        >({
            query: (arg) => {
                const { songhash } = arg
                return {
                    url: `song/score/list`,
                    method: 'GET',
                    params: { songhash },
                }
            },
        }),
        getCourceLatest: builder.query<IMinIRCourceEntity[], { count: number }>({
            query: (arg) => {
                const { count } = arg
                return {
                    url: `cource/latest`,
                    method: 'GET',
                    params: { count },
                }
            },
        }),
        getCourceScore: builder.query<
            {
                message: string
                courceData: IMinIRCourceEntity
                IRDatas: IMinIRScoreEntity
            },
            { songhash: string; userid: string }
        >({
            query: (arg) => {
                const { songhash, userid } = arg
                return {
                    url: `cource/score`,
                    method: 'GET',
                    params: { songhash, userid },
                }
            },
        }),
        getCourceScoreList: builder.query<
            {
                message: string
                courceData: IMinIRCourceEntity
                IRDatas: IMinIRScoreEntity[]
            },
            { songhash: string }
        >({
            query: (arg) => {
                const { songhash } = arg
                return {
                    url: `cource/score/list`,
                    method: 'GET',
                    params: { songhash },
                }
            },
        }),
        postSignup: builder.mutation<string, SignupRequestDto>({
            query: (body) => ({
                url: `auth/signup`,
                method: 'POST',
                body,
            }),
        }),
        postLogin: builder.mutation<
            {
                accessToken: string
                refreshToken: string
            },
            AuthenticateRequestDto
        >({
            query: (body) => ({
                url: `auth/login`,
                method: 'POST',
                body,
            }),
        }),
        postMe: builder.mutation<
            {
                accessToken: string
                refreshToken: string
                message: string
                scoreDatas: (IMinIRScoreEntity & { title: string; artist: string })[]
                userData: Omit<IMinIRUserEntity, 'rivals'> & {
                    userName: string
                    rivals: {
                        userId: string
                        userName: string | undefined
                    }[]
                }
            },
            AuthRequestDto
        >({
            query: (body) => ({
                url: `auth/me`,
                method: 'POST',
                body,
            }),
        }),
        postForget: builder.mutation<
            String,
            {
                email: string
            }
        >({
            query: (body) => ({
                url: `auth/forget`,
                method: 'POST',
                body,
            }),
        }),
        postForgetConfirm: builder.mutation<
            string,
            {
                email: string
                password: string
                code: string
            }
        >({
            query: (body) => ({
                url: `auth/forget/confirm`,
                method: 'POST',
                body,
            }),
        }),
        getUser: builder.query<
            {
                message: string
                scoreDatas: (IMinIRScoreEntity & { title: string; artist: string })[]
                userData: Pick<IMinIRUserEntity, 'bio'> & { userName: string }
            },
            { userId: string }
        >({
            query: (arg) => {
                const { userId } = arg
                return {
                    url: `user`,
                    method: 'GET',
                    params: { userId },
                }
            },
        }),
        putUserUpdate: builder.mutation<
            {
                dynamoUser: IMinIRUserEntity
                accessToken: string
                refreshToken: string
            },
            UpdateDynamoUserRequestDto
        >({
            query: (body) => ({
                url: `user/update`,
                method: 'PUT',
                body,
            }),
        }),
        getRivalList: builder.query<
            {
                message: string
                rivalList: {
                    userId: string
                    userName: string | undefined
                }[]
            },
            { userId: string }
        >({
            query: (arg) => {
                const { userId } = arg
                return {
                    url: `rival/list`,
                    method: 'GET',
                    params: { userId },
                }
            },
        }),
        postRivalAdd: builder.mutation<
            {
                userId: string
                userName: string | undefined
            }[],
            AddRivalRequestDto
        >({
            query: (body) => ({
                url: `rival/add`,
                method: 'POST',
                body,
            }),
        }),
        deleteRivalRemove: builder.mutation<
            {
                userId: string
                userName: string | undefined
            }[],
            RemoveRivalRequestDto
        >({
            query: (body) => ({
                url: `rival/remove`,
                method: 'DELETE',
                body,
            }),
        }),
        postServiceAdd: builder.mutation<
            {
                userId: string
                returnObj: unknown
                accessToken: string
                refreshToken: string
            },
            AddServiceRequestDto
        >({
            query: (body) => ({
                url: `service/add`,
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const {
    useGetSongLatestQuery,
    useGetSongScoreQuery,
    useGetSongScoreListQuery,
    useGetCourceLatestQuery,
    useGetCourceScoreQuery,
    useGetCourceScoreListQuery,
    usePostSignupMutation,
    usePostLoginMutation,
    usePostMeMutation,
    usePostForgetMutation,
    usePostForgetConfirmMutation,
    useGetUserQuery,
    usePutUserUpdateMutation,
    useGetRivalListQuery,
    usePostRivalAddMutation,
    useDeleteRivalRemoveMutation,
    usePostServiceAddMutation,
} = api
