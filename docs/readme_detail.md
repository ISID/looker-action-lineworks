## 目次

1. [LINE WORKS 連携 Action 概要](#1-line-works-連携-action-概要)
2. [LINE WORKS 連携 Action の利用前提条件](#2-line-works-連携-action-の利用前提条件)
3. [ETL 処理サンプル](#3-etl-処理サンプル)
4. [LINE WORKS の設定](#4-line-works-の設定)
5. [Heroku デプロイ設定](#5-heroku-デプロイ設定)
6. [Looker の設定](#6-looker-の設定)
7. [LINE WORKS 連携 Action の利用方法](#7-line-works-連携-action-の利用方法)
8. [免責事項](#8-免責事項)

## 1. LINE WORKS 連携 Action 概要

#### 1. LINE WORKS 連携 Action で可能なこと

Looker の Explore 画面で抽出した LINE WORKS /LINE ユーザが紐付いたリストに対して LINE WORKS 連携 Action を実行することで、Action Form 画面で入力した任意テンプレートメッセージおよび LINE ユーザのリストを、Bot 経由で複数の LINE WORKS ユーザに送信することができます。

メッセージを受信した LINE WORKS ユーザは、[外部トーク連携](https://line.worksmobile.com/jp/blog/use-cases/line-external-user-talk/)済の LINE ユーザのリストに対して、任意テンプレートメッセージが入力された状態でトーク画面に遷移できます。LINE WORKS ユーザは任意テンプレートメッセージを加筆修正し、LINE ユーザにトーク送信することができます。

**■ 操作フロー**

詳細は後述しますが、LINE WORKS 連携 Action を用いた Looker・LINE WORKS の操作フローは以下となります

1. Looker 上でデータ探索・分析をおこない、LINE ユーザーと、それに紐づく LINE WORKS ユーザーの一覧を、Explore 上で選択・表示
2. a)LINE WORKS ユーザー向け／b)LINE ユーザー向けと、それぞれに送付したいテンプレートメッセージを入力し、送信
3. LINE WORKS Bot から、送信先である LINE ユーザーのリスト および a)LINE WORKS ユーザー向けのテンプレートメッセージを、LINE WORKS ユーザーに送付
4. LINE WORKS の外部トーク連携機能および[URL スキーム機能](https://developers.worksmobile.com/jp/document/17?lang=ja)を用いて、LINE WORKS ユーザーと LINE ユーザーとのトーク画面に、b)LINE ユーザー向けテンプレートメッセージがデフォルト入力された状態で表示
5. 必要に応じて LINE WORKS ユーザーがテンプレートメッセージを修正し、LINE ユーザーにトークを送信

**■LINE WORKS 連携 Action を用いたフローイメージ図 （参考）**

操作フロー NO.3 以降のフローイメージが下図

![LINEWORKS連携Actionフロー図](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/LINEWORKS%E9%80%A3%E6%90%BAAction%E3%83%95%E3%83%AD%E3%83%BC%E5%9B%B3.png)

**■ ユースケース**

（なにかしらの CRM システムと連携されていることが前提にはなりますが）例えば誕生日が近い顧客に対してトークを送るようスタッフ・営業にレコメンドしたり、数ヶ月顧客とのトーク履歴のないスタッフ・営業に対して挨拶をするようレコメンドしたりすることが考えられます。

#### 2. LINE WORKS 連携 Action の構築方針

**■LINE WORKS 連携 Action の種別**

Looker 公式で公開している[Twilio や Slack といった**Action**](https://docs.looker.com/ja/admin-options/platform/actions)にない、**独自に Action（以降 Custom Action）**を開発したい場合、以下の 3 種類の方法があります。

LINE WORKS 連携 Action では No.3「**Action API を使用して、プライべートな Action Hub を建てる**」にて開発・構築をしています。

1. **公式が提供している Node.js のフレームワークを用いて、Looker の github に contribute する**
   Looker 公式の Action Hub は[Github 上で公開](https://github.com/looker/actions/tree/master/)されております。
   アクションを作成し、プルリクエストを送り、Looker からレビュー/検査を通ったアクションは全 Looker ユーザが利用できる形で公開され、公式の Action の一つとなります。
2. **公式が提供している Node.js のフレームワークを使い、プライベートな Action Hub を建てる**
   全ユーザに公開したくない場合は独自に Action Hub サーバを用意し、Looker インスタンス上で登録することで Action Hub として利用することが出来ます。
   [Node.js のフレームワークのテンプレート](https://github.com/looker/custom-action-hub-example)も公開されているので利用することで、簡単に開発が可能です。
3. **Action API を使用して、プライべートな Action Hub を建てる**
   公式のフレームワークを利用せずに、Action API と呼ばれるエンドポイントを直接実装することで、[Action Hub サーバを建てる](https://docs.looker.com/ja/sharing-and-publishing/action-hub)こともできます。

※Action に関する説明は、[Looker Advent Calender 2020](https://qiita.com/advent-calendar/2020/looker)に寄稿した[「Looker Custom Action を作成する」](https://qiita.com/kumakura/items/82ed393935225b9b20b3#2-custom-action%E3%81%AE%E9%96%8B%E7%99%BA%E6%96%B9%E6%B3%95)にて詳細説明をしているため、併せて参照下さい

**■LINE WORKS 連携 Action のアーキテクチャ（参考）**

![Looker_概要_02](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/Looker_%E6%A6%82%E8%A6%81_02.png)

- Action Hub サーバ

デプロイの容易さ＋再配布性の高さを考え、Heroku で Action Hub サーバを構築しております。そのため、後述するデプロイ作業でも、Deploy to Heroku Button を提供しています。

- Action API

Action API を利用する場合、HTTP リクエストを扱うことができればどの言語でも問題ありませんが、今回は TypeScript + Express で Action API を搭載したサーバを構築しました。

- LINE WORKS Bot

LINE WORKS では bot を通してメッセージを送信する場合、サーバ利用のアクセストークンを取得する必要がありますが、取得方法が*固定 IP タイプ*と*ID 登録タイプ*の 2 種類存在します。
*固定 IP タイプ*は IP を LINE WORKS 上に登録し、特定のアクセストークンを取得する方式で、*ID 登録タイプ*は認証キーを用いて JWT(JsonWebToken)を作成し、認証サーバへトークンを要請する方式となります。（下図参考）

後述する「LINE WORKS：管理コンソールでの設定準備」でも触れますが、今回は**ID 登録タイプ**を採用しています。

![LINEWORKS_token関連](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/LINEWORKS_token%E9%96%A2%E9%80%A3.png)

引用：https://developers.worksmobile.com/jp/document/1002002?lang=ja

## 2. LINE WORKS 連携 Action の利用前提条件

LINE WORKS 連携 Action を用いるために必要な、**LINE WORKS の API で取得したトークメッセージや ETL 処理は各ユーザにて準備・設定**して頂く前提となります。

また、Looker の Explore 画面で抽出した LINE WORKS /LINE ユーザが紐付いたリストに対して、Action Form 画面で入力した任意テンプレートメッセージおよび LINE ユーザのリストを送信する仕様のため、**LINE WORKS ユーザ情報と LINE ユーザ情報が紐づいた DWH 管理を各ユーザにて対応**して頂く前提となります。

上記含めた、LINE WORKS 連携 Action の利用前提条件は以下となります。

- LINE WORKS の API で取得したトークメッセージや ETL 処理は、各ユーザにて準備・設定して頂く
- LINE WORKS ユーザ情報と LINE ユーザ情報が紐づいた DWH 管理を、各ユーザにて対応

- LINEWORKS アカウントを作成済みであること（Sandbox 環境では組織連携 API 以外利用不可のため、本番アカウントが必要）
- [LINE WORKS ユーザ・LINE ユーザ間でトーク可能](https://line.worksmobile.com/jp/blog/use-cases/line-external-user-talk/)とするため、**LINE ユーザー側から**友だちとして登録済であること

## 3. ETL 処理サンプル

2 章でお伝えした通り、LINEWORKS の API で取得したトークメッセージや ETL 処理は各ユーザにて準備・設定して頂きます。

また、LINE WORKS 連携 Action の仕様に伴い、LINE WORKS ユーザ情報と LINE ユーザ情報が紐づいた DWH 管理を各ユーザにて対応して頂きます。

ただし LINE WORKS 連携 Action 利用時に必須の ETL 処理もあるため、サンプルおよび留意点を以下に記載させて頂きます。

#### 3.1. トークメッセージ取得 API

LINE WORKS が提供している[監査データのダウンロード API](https://developers.worksmobile.com/jp/document/30014002?lang=ja)を用いることで、LINEWORKS⇄LINE のトークメッセージを csv ファイルにて取得することが可能です。

ちなみにこの csv ファイルですが、LINE WORKS > Admin 画面の監査 > トークでダウンロードできる csv ファイルと同一のため、Admin 画面からダウンロードし利用しても問題ありません。

■LINE WORKS > Admin 画面の監査 > トーク画面

![LINEWORKS_ETL処理01](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/LINEWORKS_ETL%E5%87%A6%E7%90%8601.png)

#### 3.2. トークメッセージのデータ整形

LINE WORKS 連携 Action では、送信先リストと任意のテンプレートメッセージを、LINE WORKS Bot を通じて、LINE WORKS ユーザーに送信するために、ETL 処理した 3 項目を`LINEWORKS ID`,`LINE ID` `LINE NAME`としてマッピングする必要があります。

**■ トークメッセージ csv ファイル**

3.1.で取得したトークメッセージ csv ファイルは以下構成となっています。「送信者」「受信者」に、LINE WORKS ID や LINE ID、LINE ユーザー名が組み合わさり 1 カラムとして提供されています。

| 送信者<br />※後述する LookML /dimension: sender に該当 | 受信者<br />※後述する LookML /dimension: recepient に該当 |
| :----------------------------------------------------- | :-------------------------------------------------------- |
| WORKS 太郎(xxxxx@org)                                  | [LINE]山田太郎(901000000011001)                           |
| [LINE]佐藤花子(901000000011002)                        | WORKS 太郎(xxxxx@org)                                     |
| WORKS 太郎(xxxxx@org)                                  | [LINE]鈴木一郎(901000000011003)                           |
| WORKS 花子(yyyyy@org)                                  | [LINE]山田太郎(901000000011001)                           |
| [LINE]山田太郎(901000000011001)                        | WORKS 花子(yyyyy@org)                                     |
| WORKS 花子(yyyyy@org)                                  | [LINE]高橋雄一(901000000011004)                           |
| WORKS ポチ(zzzzz@org)                                  | [LINE]山田太郎(901000000011001)                           |

**■ トークメッセージから抽出した各データ**

トークメッセージ csv ファイルから、各カラムに分解した図が以下となります。

ただし、トークメッセージ csv ファイルのままでは LINE WORKS 連携 Action に必要なカラムが結合されている状態のため、**ETL 処理または LookML 記述で、必要なカラムだけ抽出する処理が必要** となります。

また、トークメッセージ csv ファイルでは「送信者」「受信者」に LINE WORKS ユーザ・LINE ユーザのデータが混在していますが、LINE WORKS 連携 Action では、**送信者に LINE を含まないように、ETL 処理または LookML 記述で処理**する必要があります。

| LINE WORKS ID | LINE WORKS ユーザ名 | LINE ID         | LINE ユーザ名 |
| :------------ | ------------------- | :-------------- | :------------ |
| xxxxx@org     | WORKS 太郎          | 901000000011001 | 山田太郎      |
| xxxxx@org     | WORKS 太郎          | 901000000011002 | 佐藤花子      |
| xxxxx@org     | WORKS 太郎          | 901000000011003 | 鈴木一郎      |
| yyyyy@org     | WORKS 花子          | 901000000011001 | 山田太郎      |
| yyyyy@org     | WORKS 花子          | 901000000011004 | 高橋雄一      |
| zzzzz@org     | WORKS ポチ          | 901000000011001 | 山田太郎      |

- `LINE WORKS ID` - トークメッセージ csv ファイル「送信者」の、（）内記載のメールアドレス
- `LINEWORKS ユーザ名` - トークメッセージ csv ファイル「送信者」または「受信者」の、LINEWORKS ID と共に記載されているユーザ名
- `LINE ID` - トークメッセージ csv ファイル「送信者」または「受信者」の、冒頭[LINE]と付与されているユーザの（）内記載の ID。
- LINE ID は LINE WORKS 内で管理されている LINE の ID のため、LINE での UUID ではありません。https://forum.worksmobile.com/jp/posts/100319
- `LINEユーザ名` - トークメッセージ csv ファイル「送信者」または「受信者」の、冒頭[LINE]と付与されているユーザ名

**■ 必要なカラムだけ抽出する処理（LookML 処理）**

**LINE WORKS ユーザ情報と LINE ユーザ情報が紐づいた DWH を Looker と接続している前提**での LookML 処理となります。

トークメッセージ csv ファイルから、LookML 処理で「LINE WORKS ID」「LINE WORKS ユーザ名」「LINE ID」「LINE ユーザ名」を抽出・dimension として定義する sql を、下図にてサンプル記載しています。

ただしこの sql は、**Amazon Athena の DML：[Presto 0.172](https://prestodb.io/docs/0.172/index.html) と [Presto 0.217](https://prestodb.io/docs/0.217/index.html) に準拠した記載**のため、接続している DWH 環境に併せて書いてください。

![LookML](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/LookML.png)

LookML で定義している dimension と、トークメッセージから抽出した各データの紐付けは以下となります。

| トークメッセージから抽出した各データ | LookML での dimension | サンプル値      |
| ------------------------------------ | --------------------- | --------------- |
| LINE WORKS ID                        | sender_id             | xxxxx@org       |
| LINE WORKS ユーザー名                | sender_name           | WORKS 太郎      |
| LINE ID                              | recipient_id          | 901000000011001 |
| LINE ユーザ名                        | recipient_name        | 山田太郎        |

`dimension: sender_id`- LINE WORKS Bot から受信する「LINE WORKS ID」

`dimension: sender_name`- LINE WORKS Bot から受信する「LINE WORKS ユーザー名」(\*)

`dimension: recipient_name` - LINE WORKS ユーザからメッセージ送付する「LINE ユーザ名」

`dimension: recipient_id`- INE WORKS ユーザからメッセージ送付する「LINE ID」

**\*LINE WORKS ユーザ名の留意点**

`sender_name`は[LINE WORKS の API 仕様](https://developers.worksmobile.com/jp/document/1005050/v1?lang=ja)にて、20 文字上限という制限があります。

そのため、`sender_name`に 20 文字以上のデータが格納されている場合は、**20 文字以降が「…」として省略表示**される仕様となります。

**■ 送信者に LINE を含まないようフィルタ処理（LookML 処理**)

LINE WORKS 連携 Action では、LINE WORKS Bot → LINE WORKS ユーザ → LINE ユーザ という想定で開発をしているため、ETL 処理または LookML にて、送信者に LINE を含まないようフィルタ処理が必要となります。

以下は LookML でフィルタ処理をしたサンプルとなります。

![LookML02](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/LookML02.png)

#### 3.3. LINE WORKS 連携 Action 設定用準備

後述する「6. Looker の設定」の手順内で Looker 管理画面で設定が必要なため、**Explore 画面で表示している名称**をコピーして控えておいて下さい。

- `dimension: sender_id`が**Explore 画面：フィールドピッカーで表示されている名称** （例）下図の**[Sender ID]**をコピー

- `dimension: recipient_name` が**Explore 画面：フィールドピッカーで表示されている名称**

- `dimension: recipient_id`が**Explore 画面：フィールドピッカーで表示されている名称**

※`dimension: sender_name`は、LINE WORKS 連携 Action では利用しないマッピング項目のためコピー不要

![Looker_Explore](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/Looker_Explore.png)

## 4. LINE WORKS の設定

LINE WORKS の設定手順は以下となります。

#### 1. [LINE WORKS DevelopperConsole](https://developers.worksmobile.com/jp/?lang=ja)にログイン

#### 2. API を以下手順で設定

1.  Server API Consumer Key 　を設定

2.  発行ボタンを押下し、以下を設定

3.  API 利用範囲で「トーク Bot（追加）」を選択

4.  Token 自動延長は「ON」を選択

5.  Server List(ID 登録タイプ) を設定

    1. 追加ボタンを押下し、任意サーバー名・紐付ける Server API Consumer Key を選択して設定

    2. 認証キーを管理画面からダウンロード（.key ファイル内に記載）

       ※認証キーは、ヘッダー・フッターの`-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`も含めてコピーすること

#### 3. BOT を作成

1. LINEWORKS 上で受信する、「顧客リストメッセージ」の送信元＝ Bot として利用したい画像・Bot 名称 を設定

2. Bot ポリシーの「トークルームへの招待」はチェックをつけず有効化しない　※「チーム/グループ/1:N トークに招待不可」と表示されること

（参考）LINE WORKS 連携 Action で作成したトーク BOT では、メッセージ送信に以下 API を利用

1.  メッセージ送信https://developers.worksmobile.com/jp/document/1005008?lang=ja
2.  URL スキーマ（スマホのみ利用可）https://developers.worksmobile.com/jp/document/10017001?lang=ja
3.  ボタンテンプレートhttps://developers.worksmobile.com/jp/document/100500804?lang=ja

#### 4. Heroku でのデプロイ設定に用いる項目をコピー

後続の Heroku でのデプロイ設定用に、以下をコピーして控えておく

- API

  - `API ID`- 管理画面からコピー
  - `Server API ConsumerKey`の`Key`- 管理画面からコピー
  - `Server List（ID登録タイプ）`の`認証キー` - ダウンロードした.key ファイルからコピー
  - `Server List（ID登録タイプ）`の`ID`- 管理画面からコピー

- Bot
  - `Bot No.`- 管理画面からコピー

## 5. Heroku デプロイ設定

Heroku の設定手順は以下となります。

#### 1. 以下の Deploy to Heroku ボタンを押下　**★ 後でリンク貼り替え**

![Deploy](https://www.herokucdn.com/deploy/button.png)

#### 2. 任意の App name を入力

#### 3. 環境変数を入力しデプロイ実施

LINE WORKS 管理画面でコピーした項目を、環境変数として以下入力し、Deploy app ボタンを押下しデプロイを実施

- `LINEWORKS_API_ID` - LINE WOKS の管理画面で取得した[API ID]をペースト
- `LINEWORKS_BOT_NO`- LINE WOKS の管理画面で取得した[Bot No.]をペースト
- `LINEWORKS_CONSUMER_KEY`- LINE WOKS の管理画面で取得した ServerAPI ConsumerKey の[Key]をペースト
- `LINEWORKS_SERVER_AUTH_KEY` - LINE WOKS の管理画面で取得した Server List（ID 登録タイプ）の[ID]をペースト
- `LINEWORKS_SERVER_ID` -LINE WOKS の管理画面で取得した Server List（ID 登録タイプ）の[認証キー]をペースト
- `SECRET_TOKEN`- 自動生成されるため入力不要

#### 4. 自動生成された Secret Token をコピー

デプロイ完了後、後続の Looker 画面設定用に、**自動生成された以下項目**を Heroku 画面上からコピーして控えておく

- `SECRET_TOKEN` - Looker からの接続制限をかける設計にしているため、Looker 管理画面で`Authorization Token`として入力が必要

![Heroku_deploy_04](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/Looker_action_04.png)

## 6. Looker の設定

Looker の設定手順は以下となります。

![Looker_action_05](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/Looker_action_05.png)

---

#### 2. Explore 画面のフィールドピッカー表示名称で紐付け

LINE WORKS Bot から送付する LINE WORKS /LINE ユーザ送信先リストおよび任意テンプレートメッセージと、LINE WORKS ユーザから LINE ユーザ送信先リストへ送付する任意テンプレートメッセージを取得するため、以下 3 項目を Looker 側で紐付けを行う。

- LINE WORKS ID
  - LINE WORKS Bot から LINE WORKS ユーザに、LINE ユーザ送信先リスト・LINE ユーザ向け任意テンプレートメッセージを送付する際に必要な項目
  - LINE WORKS ID（例：xxxxx@org） に該当する dimension が、Explore 画面：フィールドピッカーで表示されている名称をペースト
- LINE ID
  - LINE WORKS ユーザから LINE ユーザに、任意テンプレートメッセージを送付する際に必要な項目
  - LINE ID（例：901000000011001） に該当する dimension が、Explore 画面：フィールドピッカーで表示されている名称をペースト
- LINE NAME
  - LINE WORKS Bot から LINE WORKS ユーザに、LINE ユーザ送信先リスト・LINE ユーザ向け任意テンプレートメッセージを送付する際に、[ボタンテンプレート](https://developers.worksmobile.com/jp/document/100500804?lang=ja)にて LINE ユーザ名称を表示する際に必要な項目
  - LINE NAME（例：山田太郎） に該当する dimension が、Explore 画面：フィールドピッカーで表示されている名称をペースト

■Looker 管理画面

![Looker管理画面_マッピング](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/Looker%E7%AE%A1%E7%90%86%E7%94%BB%E9%9D%A2_%E3%83%9E%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0.png)

#### 3. Looker の Explore 画面でクエリ発行

Looker 管理画面で`LINE WORKS ID` `LINE ID` `LINE NAME` に入力した Explore 入力表示画面名称が、**必ずクエリ結果に含まれるように、該当する dimension を Explore で選択**しクエリを発行。（その他項目は任意で追加しても OK）

以下は、Explore でクエリ発行し表出力した際のイメージ図。

| LINEWORKS ID | LINE ID         | LINE ユーザ名 |
| :----------- | :-------------- | :------------ |
| xxxxx@org    | 901000000011001 | 山田太郎      |
| xxxxx@org    | 901000000011002 | 佐藤花子      |
| xxxxx@org    | 901000000011003 | 鈴木一郎      |
| yyyyy@org    | 901000000011001 | 山田太郎      |
| yyyyy@org    | 901000000011004 | 高橋雄一      |
| zzzzz@org    | 901000000011001 | 山田太郎      |

上記の場合、LINE WORKS 連携 Action では**LINE WORKS ID 単位**で、LINE WORKS /LINE ユーザ送信先リストおよび任意テンプレートメッセージを送信。

- xxxxx@org へ送付する、LINE ユーザリスト
  - 山田太郎(901000000011001)、佐藤花子(901000000011002)、鈴木一郎（901000000011003）
- yyyyy@org へ送付する、LINE ユーザリスト
  - 山田太郎(901000000011001)、高橋雄一（901000000011004）
- zzzzz@org へ送付する、LINE ユーザリスト
  - 山田太郎(901000000011001)

## 7. LINE WORKS 連携 Action の利用方法

LINE WORKS および Looker での設定完了後、LINE WORKS 連携 Action の主な利用方法は以下となります。

#### Action フォーム画面で設定

1. 6 章の[3. Looker の Explore 画面でクエリ発行](#3lookerのexplore画面でクエリ発行)を行った Explore から「送信」ボタンを押下し、Action フォーム画面で LINE WORKS を選択
2. LINE WORKS ユーザ向けのテンプレートメッセージ、LINE ユーザ向けのテンプレートメッセージをそれぞれ入力して送信（リアルタイム配信）

![Looker_ActionForm](https://github.com/KumakuraKoki/looker-action-lineworks/blob/image/readme/Looker_ActionForm.png)

#### LINE WORKS 連携 Action の送信方法

LINE WORKS 連携 Action では上記の「Explore 画面から即時送信」含め、Looker デフォルト機能を用いた以下配信が可能です。

- リアルタイム配信：

  - Explore でクエリ発行した内容を、LINE WORKS Bot に即時配信することが可能です。営業に顧客向けメッセージを送信指示したい場合に素早くレコメンド送信できます。

* スケジュール配信：

  - 指定した条件に合わせて、クエリ発行した内容を LINE WORKS Bot に配信可能です。スケジュール配信単位でテンプレートメッセージを保存できるため、指定条件を変えずにテンプレートメッセージだけを簡単に変更することができます。顧客の誕生月や最終訪問時から 1 ヶ月後など、蓄積データのステータスをトリガーに、スケジュール配信を設定することも可能です。予定しているデータを最も必要としている人に、適切な頻度・適切なメッセージで送信することで、商機損失を防ぎます。

- アラート通知：

  - 指定した条件に合致した場合、クエリ発行した内容を LINE WORKS Bot に即時送信可能です。閾値を超過した際にメールアラートを設定すると、問題が発生したときでも顧客や現場ユーザへの連絡が簡単です。

## 8. 免責事項

本 OSS の使用により問題が生じた場合 および 不具合に対する対応責任は負いません。

また、本 Readme で記載している設定方法および画面ショットは、以下バージョンでの記載・添付となります。

バージョンアップに伴う本 Readme の更新作業や、各製品・ツールのバージョンアップ後の動作稼働担保は行いません。

・LINE WORKS（iOS 版）：2.8.0

・Looker：7.16
