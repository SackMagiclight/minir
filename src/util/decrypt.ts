import CryptoJS from 'crypto-js'

const baseData = {
    get_contest: 'U2FsdGVkX1/LRV+ctdAhwX9rOY6WQ/N2eiebDDveiigNNxpTOLxOeAIPlWhCHG1m0ZEClJHCDlPeDgA28PA2bf2HPdq3Z/y2vMU4lBvsCwU=',
    join_contest: 'U2FsdGVkX1+8/3b9t2KGYOP4kn8tYpdRks5UDbhvxIFHR/w7JxRPYsCv3K38izfhOA331Lnt7OgpD5V77F4lu8A1ZLnUjiMpGMOInXsIMUg=',
    leave_contest: 'U2FsdGVkX1/D4N9ZqfnjvJH8U6ZSr9i9EDrXk42ws17I2w6u1eWXADVeIxU2/2D6Wg0o8i8RIvMakrBwjzBP8STXBQ8SQOWqlqQXXpimNis=',
    get_contests_100:
        'U2FsdGVkX1/LRV+ctdAhwX9rOY6WQ/N2eiebDDveiigNNxpTOLxOeAIPlWhCHG1m0ZEClJHCDlPeDgA28PA2bf2HPdq3Z/y2vMU4lBvsCwU=',
    get_cource_played_100:
        'U2FsdGVkX1/JDkz8UkTbbcBUHre/FzPUOYVprUoEpxORQqzEAainl9y3rdP1b5NDyuvWxaxt3+B7PzR95pEKSp+c5daA0hCpWTANhXsDbBk=',
    create_contest:
        'U2FsdGVkX19m8KScn/xiTW7mZClb01eVHlVQj2QWZ2Mj//+g2Y22WOqWVfBCQTt/AV9BwVp6kJMAWFg0IBP2PFC2Y71xgnkJU5YfeUC+wZw=',
    get_song_data: 'U2FsdGVkX1/R4aFmkx/lKi6vFeZDSQn7E/qcNCNn3944XMlPAh9j1tKgkH002ckM+xKOaF/+7UBc23nZbzmfn0MfdYVSx5BKtgtk8BGIrDY=',
    auth_service: 'U2FsdGVkX1/QWpI6QrzhXLGfRX8sPydATkSbVUhcQedCA6gDxg1170fNv8BJyemnFGokJln0u6h1NNHJ+RoI/7TDDM+X9ftuVMOUCAshxs0=',
    get_cource_data:
        'U2FsdGVkX1+d4fUSlknFqBJbM4XNAK04WMSJXLUe0rGvXCaXk+Fo6EdMjUtbCJFDlZS+YWQ4bHBfADFm5+Fp9cN9YRzDKZ6RROKdPgiESis=',
    get_played_100:
        'U2FsdGVkX1+YVBf8zH0fYNhjzaa/N5Zd/jDoyy0+NItuyeRxDnD4wU4vlMQQwhOVTgJW/LmENScOdlLbJGfDP7E6WHKMtan7UIF2Z+3bBcU=',
    search_song_data:
        'U2FsdGVkX1+kDo2ZnYolIjmoZRtqOqhF4KGi3PkO621LkJ5OtnbwJne6c/uPUZgQPWUgODBR4z54E4e7kQQmi5l/6+rd8/kvlTbFiahJ6eY=',
    sign_up: 'U2FsdGVkX1+PbRLqxfrvdihxI03fx7Yij6yl9LEc0aIpJPHuXGnKX71lCWBEnjIJXT3osj0AA2wQGvHFt1YagxtgVh5IcVdwnTqt7cBY96M=',
    forget_password:
        'U2FsdGVkX1+PbRLqxfrvdihxI03fx7Yij6yl9LEc0aIpJPHuXGnKX71lCWBEnjIJXT3osj0AA2wQGvHFt1YagxtgVh5IcVdwnTqt7cBY96M=',
    reset_password:
        'U2FsdGVkX1+PbRLqxfrvdihxI03fx7Yij6yl9LEc0aIpJPHuXGnKX71lCWBEnjIJXT3osj0AA2wQGvHFt1YagxtgVh5IcVdwnTqt7cBY96M=',
    get_user_data: 'U2FsdGVkX1+qlDrCpvJlfqL5sso14z7i8OUSTW3K+DrtfFTr+e+fs57UbcCtTbCSJwSED6+fIYxn2rtlbYED1O1DoJjWfKCgxTQsaGmJ6Cc=',
    get_user_data_login:
        'U2FsdGVkX185fM5IVkyI1B5NlIzijjJ6wcsBMds6JutUOL9HR1qqYKivqub1PeSpIJid8bISxblm3NDT2VEngAItkl261hs80NHKl0pC2rI=',
    update_user_data:
        'U2FsdGVkX19a1e1Al1LpQAUPvZSxVP6UpfMCJ3OVS/5tN0+5C9OtJer+4NEyDNbFo7BRjCpvWsdc901Bdkw8lSiWUnyx/8XK1HFvfxxLmOg=',
    add_rival: 'U2FsdGVkX1+8h3XMoz68BTTKeTauXh13cAB4WRvqV6vsyl/zoRAieq/ffdVDc6snLde6yY2omA2YqgDpDRjzN5XRCYQcB2aPuH2p6WOT4yg=',
    remove_rival: 'U2FsdGVkX19ptK/BOqN0VTS2Jb42UGS6NjaSpmEd24ibn8TNM+HKJkJ3DhcxNiMLxhTYLiFc43m/5YaPxsHWJ94rZKbS5h0IZ/EIdKnSD1o=',
    update_song_data:
        'U2FsdGVkX1+nt1SysJP58CW/05ySx/vr3Wp+mh/KLrOtrxQVhs9o/FYfyBdPsRVV1gBYzZwRYlCnJIzYyGQmDwIUNOcQcuWNV1zXYx9VmG4=',
}

export const getAccessKeyAndSecret = (method: keyof typeof baseData) => {
    const ciphertext = baseData[method]
    const bytes = CryptoJS.AES.decrypt(ciphertext, '600c1113583268dd241ec91f221f2bf6cfcb8f83bb5d27b5a35390996035749a')
    const originalText = bytes.toString(CryptoJS.enc.Utf8)
    return originalText
}
