import { Box } from '@chakra-ui/react'
import { DefaultLayout } from '~/layout/Default'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import ReactMarkdown from 'react-markdown'
import { Helmet } from 'react-helmet-async'

export default () => {
    const m = `
## Flavor Log

ざっくり言うとbeatorajaが生成する各種DBファイルのビュワーです。
インストーラー関連（後述）以外は、インターネット接続は必要なく、すべてローカル環境で動作します。

***

### インストールから起動まで

#### 1. インストーラーをダウンロードします。  

→[FlavorLog.exe](https://flavor-log.gaftalk.com/FlavorLog%20Setup%200.0.5.exe)


#### 2. インストーラーを実行します。  
**インストールフォルダは「beatoraja.jar(exe)」と同じ階層にすることをおすすめします。**  
（実行時のDBファイル参照の標準設定が「beatoraja.jar(exe)」と同じ階層であるため）  

\`\`\`
- beatoraja.jar
- beatoraja.exe
- FlavorLog (folder)
-- FlaverLog.exe
\`\`\`


#### 3. FlavorLog.exeを起動します。
![main.png](/minir/flavorlog/main.png)

エラーが出る、または何も表示されない場合は参照するDBファイルが間違っている可能性があります。  
FlavorLogフォルダ内の「\`config.json\`」をテキストエディタで開き、下記を参考にして参照するDBファイルのパスを修正してください。  

![config.png](/minir/flavorlog/config.png)

\`\`\`
{
	"ui": { // 注：動作しますが開発途中です
		"bgColor": "#FFFFFF",   // メイン画面背景色
		"infoColor": "#FFFFFF"  // メイン画面日付周りの背景色
	},
	"beatoraja": {
		"folder": "{beatorajaフォルダパス}",
		"songDbPath": "{beatoraja songdata.dbパス}",
		"scoreLogPath": "{beatoraja player\\player1\\scorelog.db パス：プレイヤー名を変えている場合は変更必須}",
		"scorePath": "{beatoraja player\\player1\\score.db パス：プレイヤー名を変えている場合は変更必須}"
	}
}
\`\`\`

***

### 主な機能

#### 1. 更新時のログ表示
起動直後に表示される画面は、スコアに何かしらのアップデートがあった際に記録されるログ（\`player\\player1\\scorelog.db\`）のビュワーです。  
「初回プレー」「クリアランプの更新」「スコアの更新」等でログが記録されます。  
「今日の更新なんだっけ」の解消を目的としています。  

DBファイルの変更を監視しているため、**beatoraja起動中にスコアが更新されると自動でリロード**されます。

#### 2. プレー譜面履歴の表示
メイン画面ツールバー「Window」から「Open Play History」を選択することで、過去のプレー譜面の履歴表示画面が表示されます。  
![openplay.png](/minir/flavorlog/openplay.png)  
![playhistory.png](/minir/flavorlog/playhistory.png)  

この画面は、現状スコア（\`player\\player1\\score.db\`）のビュワーです。  
プレー回数の更新順（降順）で表示されます。  
（複数回プレーした場合は、最後の更新日を基準として表示します）  
プレーした譜面のタイトル確認（今日なにやったっけ）を目的としています。  
同じく、DBファイルの変更を監視しているため、**beatoraja起動中にプレー回数が更新されると自動でリロード**されます。

譜面タイトルをクリックすることで、MinIRのIRページに遷移します。

#### 3. 自動アップデート
インターネット接続時、FlavorLogは起動時に自動でアップデートをチェックし、アップデート用インストーラーをダウンロードします。  
アップデートがある場合は、起動時にダイアログが表示されるので確認及びインストールすることをおすすめします。  

***

### 免責事項
開発中のため、予告なく仕様が変更される可能性があります。  
また、不具合が発生する可能性があります。  
本ソフトウェアを使用したことによるいかなる損害に対しても、開発者は一切の責任を負いません。  
使用の際は、**beatorajaの各種ファイルのバックアップを取得しておくことを強く推奨**します。

    `
    return (
        <DefaultLayout>
            <Helmet>
                <title>Flavor Log</title>
            </Helmet>
            <Box padding={10}>
                <ReactMarkdown components={ChakraUIRenderer()} skipHtml>
                    {m}
                </ReactMarkdown>
            </Box>
        </DefaultLayout>
    )
}
