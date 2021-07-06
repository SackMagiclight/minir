<template>
  <v-container fluid>
    <h1>MinIR とは</h1>
    <p>beatoraja用に設計されたIRです。 下記コンセプトに基づいています。</p>
    <ul>
      <li>
        できるだけ安価に済ませたい
        <ul>
          <li>
            なので、AWSの無料枠で収まるように設計(
            <strong>収まってほしい</strong>)
          </li>
          <li>
            保存するデータを最小限にすることで、課金を抑える
            <ul>
              <li>保存データが確定するまでもうちょっとかかるかな？</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        最低限の機能
        <ul>
          <li>
            <strong>スコアが譜面ごとに記録できること</strong>のみを要件に開発
          </li>
          <li>
            そのため下記内容は実装予定がありません（今後変わるかもだけど）
            <ul>
              <li>段位認定（難易度表で対応してください。スコア送信できます。(0.5.6以降の本体必須)）</li>
              <li>ライバル機能（無課金で対応するのが難しい）</li>
              <li>楽曲検索(RDBじゃないので非現実的な負荷)</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        万が一に備えた再利用性
        <ul>
          <li>AWSを利用することで、サーバー管理の引き継ぎが容易</li>
        </ul>
      </li>
      <li>
        ぶっちゃけAWSの勉強で作った
        <ul>
          <li>すいません、ガッツリ運用するかは未知数です</li>
          <li>人が足りない</li>
          <li>本当は実装予定なし機能はやりたい…</li>
        </ul>
      </li>
    </ul>
    <h1>参加方法</h1>
    <ul>
      <li>
        <p>
          MinIR「SIGN
          UP」ページからサインアップ（ユーザー作成）を行ってください。
          <br />登録したメールアドレスに対して、認証メールが送信されます。メール内リンクをクリックして登録を完了させてください。
        </p>
      </li>
      <li>
        <p>
          本体内
          <code>beatoraja-config.bat</code>
          から起動します。IR機構は同梱されているため、特別な操作は不要です。
          <br />IRタブで「MinIR」が選択できるようになっていれば問題ありません。
          登録したメールアドレス/パスワードを入力し、起動してください。
        </p>
      </li>
      <li>
        <p>
          基本的に、本体「ir」フォルダに同梱されている「minir-xxx.jar」を利用しますが、jarの更新がある場合があります。
          <br />更新があった場合は「Download
          API」からjarをダウンロードして上書き（置き換え）してください。
          <br />更新情報はMinIRトップページに表示されています。
        </p>
      </li>
    </ul>
    <h1>本体 - jar API 対応表</h1>
    <p>
      IRに送信可能な本体とAPIの組み合わせ表です。
      <br />記述されていない本体、APIではIRへの送信が行うことができません。
    </p>
    <table class="api-table">
      <thead>
        <tr>
          <th></th>
          <th>minir-420</th>
          <th>minir-421</th>
          <th>minir-430</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>beatoraja 0.8.3</td>
          <td>▲(Cource送信不可)</td>
          <td>○</td>
          <td>○</td>
        </tr>
        <tr>
          <td>beatoraja 0.8.2</td>
          <td>▲(Cource送信不可)</td>
          <td>○</td>
          <td>○</td>
        </tr>
        <tr>
          <td>beatoraja 0.8.1</td>
          <td>▲(Cource送信不可)</td>
          <td>○</td>
          <td>○</td>
        </tr>
        <tr>
          <td>beatoraja 0.8.0</td>
          <td>▲(Cource送信不可)</td>
          <td>○</td>
          <td>○</td>
        </tr>
      </tbody>
    </table>
    <h1>現状できること</h1>
    <ul>
      <li>
        譜面のスコア送信
        <ul>
          <li>スコアが上回っていればスコアが上書き、クリアが上回っていればクリア状況が上書きされます。</li>
          <li>beatoraja上でのログイン必須です。</li>
        </ul>
      </li>
      <li>
        コースのスコア送信
        <ul>
          <li>スコアが上回っていればスコアが上書き、クリアが上回っていればクリア状況が上書きされます。</li>
          <li>beatoraja上でのログイン必須です。</li>
        </ul>
      </li>
      <li>譜面のスコア閲覧</li>
      <li>コースのスコア閲覧</li>
      <li>直近100件のIR送信された譜面リスト</li>
      <li>直近100件のIR送信されたコースリスト</li>
      <li>
        ユーザーページ
        <ul>
          <li>
            ログイン時は、自身のユーザー情報を編集できます。(SETTING
            から移動できます)
          </li>
        </ul>
      </li>
      <li>
        コンテストの作成・参加
        <ul>
          <li>指定期間内で特定楽曲のスコアを記録する機能です（大会などを想定）</li>
          <li>作成・参加・スコア送信はログイン必須です。</li>
        </ul>
      </li>
      <li>ログイン</li>
      <li>ログアウト</li>
    </ul>
    <h1>禁止事項</h1>
    <ul>
      <li>
        違法な楽曲の登録・プレイ
        <ul>
          <li>発見次第、プレイアカウントは永久凍結処分となります。</li>
        </ul>
      </li>
      <li>
        ユーザコメント欄における誹謗中傷
        <ul>
          <li>管理者裁定の無い限り削除しません。また管理者には削除の義務や責任はありません。</li>
          <li>個人を完全に特定する情報を伴っているものは削除対象です。</li>
        </ul>
      </li>
      <li>
        ユーザコメント欄における私生活情報の記述
        <ul>
          <li>情報価値が無く、私事のみの情報・第三者の確認できないプライベート情報は、個人が完全に特定されなくても、対象者に不利益が発生する可能性があれば、一律削除対象とします。</li>
        </ul>
      </li>
      <li>
        ユーザコメント欄における外部リンク
        <ul>
          <li>営利目的での外部リンク（アフィリエイトサイトなど）、悪意あるサイトへのリンク（フィッシングサイトなど）は削除対象です。</li>
          <li>非営利目的での外部リンク（外部SNS、他BMSリポジトリへのリンク等）は削除対象外です。</li>
        </ul>
      </li>
      <li>
        改変したbeatoraja及びMinIR APIでのIR接続、MinIR API のリバースエンジニアリング等解析行為
        <ul>
          <li>発見次第、プレイアカウントは永久凍結処分となります。</li>
          <li>該当プレイヤーのスコアは即時削除されます。</li>
          <li>該当行為は不正アクセス禁止法・著作権法に抵触する恐れがあります。</li>
        </ul>
      </li>
      <li>
        その他日本の法律に違反する行為・違反の恐れのある行為
        <ul>
          <li>発見次第、プレイアカウントは永久凍結処分となります。</li>
          <li>該当プレイヤーのスコアは即時削除されます。</li>
        </ul>
      </li>
    </ul>
    <p>その他ご意見・ご感想はDiscode DMでよろしくおねがいします。</p>
    <hr />
    <p>海岸砂丘(Sack Magiclight)#6651</p>
  </v-container>
</template>

<style scoped>
.api-table {
  border-collapse: collapse;
  border-spacing: 0;
}

.api-table th {
  font-weight: normal;
  padding: 10px;
  text-align: center;
}

.api-table td {
  padding: 10px;
  text-align: center;
}

.api-table tr:nth-child(odd) {
  background-color: #eee;
}
</style>
