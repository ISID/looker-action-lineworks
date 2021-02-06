
# looker-action-lineworks

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/ISID/looker-action-lineworks)

## 目次

1. [LINE WORKS連携Action 概要](#1-line-works連携action概要)
2. [LINE WORKS連携Action の利用前提条件](#2-line-works連携actionの利用前提条件)
3. [LINE WORKSの設定](#3-line-worksの設定)
4. [Herokuデプロイ設定](#4-herokuデプロイ設定)
5. [Lookerの設定](#5-looker-の設定)
6. [LINE WORKS連携Actionの利用方法](#6-line-works連携actionの利用方法)
7. [免責事項](#7-免責事項)

## 1. LINE WORKS連携Action概要

#### 1. LINE WORKS連携Actionで可能なこと

LookerのExplore画面で抽出したLINE WORKS/LINEユーザが紐付いたリストに対してLINE WORKS連携Actionを実行することで、<br>
ActionForm画面で入力した任意テンプレートメッセージ および LINEユーザのリストを<br>
Bot経由で複数のLINE WORKSユーザに送信することができます。

メッセージを受信したLINE WORKS ユーザは、[外部トーク連携](https://line.worksmobile.com/jp/blog/use-cases/line-external-user-talk/)済のLINEユーザのリストに対して、<br>
任意テンプレートメッセージが入力された状態でトーク画面に遷移できます。<br>
LINE WORKSユーザは任意テンプレートメッセージを加筆修正し、LINEユーザにトーク送信することができます。

**■LINE WORKS連携Actionを用いたフローイメージ図 （参考）**

![LINE　WORKS連携Actionフロー図](https://github.com/ISID/looker-action-lineworks/blob/image/readme/LINEWORKS%E9%80%A3%E6%90%BAAction%E3%83%95%E3%83%AD%E3%83%BC%E5%9B%B3.png)

#### 2. LINE WORKS連携Actionのアーキテクチャ

Heroku(Heroku Button)で Action Hub サーバを構築しており、アーキテクチャ全体イメージは下図となります。

※詳細は弊社記載の[Qiita](https://qiita.com/kumakura/items/48d14b31fda4e8c46c0b)記事も参照下さい

![Looker_概要_02](https://github.com/ISID/looker-action-lineworks/blob/image/readme/Looker_%E6%A6%82%E8%A6%81_02.png)



## 2. LINE WORKS連携Actionの利用前提条件

LINE WORKS連携Actionを用いるために必要な、**LINE WORKSのAPIで取得したトークメッセージやETL処理は各ユーザにて準備・設定**して頂く前提となります。

また、LookerのExplore 画面で抽出したLINE WORKS /LINEユーザが紐付いたリストに対して、<br>
ActionForm画面で入力した任意テンプレートメッセージ および LINEユーザのリストを送信する仕様のため、<br>
**LINE WORKSユーザ情報とLINEユーザ情報が紐づいたDWH管理を各ユーザにて対応**して頂く前提となります。

上記含めた、LINE WORKS連携Actionの利用前提条件は以下となります。

- LINE WORKSのAPIで取得したトークメッセージやETL処理は、各ユーザにて準備・設定して頂く
- LINE WORKSユーザ情報とLINEユーザ情報が紐づいたDWH管理を、各ユーザにて対応
- LINE WORKSアカウントを作成済みであること（Sandbox環境では組織連携API以外利用不可のため、本番アカウントが必要）
- [LINE WORKSユーザ・LINEユーザ間でトーク可能](https://line.worksmobile.com/jp/blog/use-cases/line-external-user-talk/)とするため、**LINEユーザ側から**友だちとして登録済であること



## 3. LINE WORKSの設定

LINE WORKSの設定手順は以下となります。

#### 1. [LINE WORKS DevelopperConsole](https://developers.worksmobile.com/jp/?lang=ja)にログイン

#### 2. APIを以下手順で設定

1.  Server API Consumer Keyを設定

2.  発行ボタンを押下し、以下を設定

3.  API利用範囲で「トーク Bot（追加）」を選択

4.  Token自動延長は「ON」を選択

5.  Server List(ID 登録タイプ) を設定

    1. 追加ボタンを押下し、任意サーバー名・紐付ける Server API Consumer Key を選択して設定

    2. 認証キーを管理画面からダウンロード（.key ファイル内に記載）

       ※認証キーは、ヘッダー・フッターの`-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`も含めてコピーすること

#### 3. BOT を作成

1. LINE WORKS上で受信する、「顧客リストメッセージ」の送信元＝ Bot として利用したい画像・Bot 名称 を設定

2. Botポリシーの「トークルームへの招待」はチェックをつけず有効化しない　※「チーム/グループ/1:N トークに招待不可」と表示されること


    （参考）LINE WORKS連携Actionで作成したトークBOTでは、メッセージ送信に以下APIを利用

    1. メッセージ送信https://developers.worksmobile.com/jp/document/1005008?lang=ja
    2. URLスキーマ（スマホのみ利用可）https://developers.worksmobile.com/jp/document/10017001?lang=ja
    3. ボタンテンプレートhttps://developers.worksmobile.com/jp/document/100500804?lang=ja

#### 4. Herokuデプロイ設定で用いる項目をコピー

後続のHerokuデプロイ設定用に、以下をコピーして控えておく

- API

  - `API ID`- 管理画面からコピー
  - `Server API ConsumerKey`の`Key`- 管理画面からコピー
  - `Server List（ID登録タイプ）`の`認証キー` - ダウンロードした.key ファイルからコピー
  - `Server List（ID登録タイプ）`の`ID`- 管理画面からコピー

- Bot
  - `Bot No.`- 管理画面からコピー



## 4. Herokuデプロイ設定

Herokuの設定手順は以下となります。

#### 1. 以下の Deploy to Herokuボタンを押下　**★ 後でリンク貼り替え**

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/ISID/looker-action-lineworks)

#### 2. 任意のApp nameを入力

#### 3. 環境変数を入力しデプロイ実施

LINE WORKS管理画面でコピーした項目を、環境変数として以下入力し、Deploy appボタンを押下しデプロイを実施

- `LINEWORKS_API_ID` - LINE WOKS の管理画面で取得した[API ID]をペースト
- `LINEWORKS_BOT_NO`- LINE WOKS の管理画面で取得した[Bot No.]をペースト
- `LINEWORKS_CONSUMER_KEY`- LINE WOKS の管理画面で取得した ServerAPI ConsumerKey の[Key]をペースト
- `LINEWORKS_SERVER_AUTH_KEY` - LINE WOKS の管理画面で取得した Server List（ID 登録タイプ）の[ID]をペースト
- `LINEWORKS_SERVER_ID` -LINE WOKS の管理画面で取得した Server List（ID 登録タイプ）の[認証キー]をペースト
- `SECRET_TOKEN`- 自動生成されるため入力不要

#### 4. 自動生成されたSecret Tokenをコピー

デプロイ完了後、後続のLooker画面設定用に、**自動生成された以下項目**を Heroku 画面上からコピーして控えておく

- `SECRET_TOKEN` - Looker からの接続制限をかける設計にしているため、Looker 管理画面で`Authorization Token`として入力が必要

![Heroku_deploy_04](https://github.com/ISID/looker-action-lineworks/blob/image/readme/Looker_action_04.png)




## 5. Looker の設定

Lookerの設定手順は以下となります。

#### 1. PrivateAction の追加

1. Lookerにログインし、管理タブ > Action > AddActionHubボタンを押下してPrivateActionを追加
2. Heroku でデプロイしたappのURL を`Action Hub URL`に入力
3. Lookerからの接続制限を設定しているため初回入力時はアラートが表示されるが、Configure Authorizationボタンを押下
4. herokuの環境変数にてコピーしておいた`SECRET_TOKEN` を、`Authorization Token`に入力し、Update Tokenボタンを押下

![Looker_action_05](https://github.com/ISID/looker-action-lineworks/blob/image/readme/Looker_action_05.png)

---

#### 2. Explore 画面のフィールドピッカー表示名称で紐付け

LINE WORKS Botから送付するLINE WORKS/LINEユーザ送信先リストおよび任意テンプレートメッセージと、<br>
LINE WORKSユーザからLINEユーザ送信先リストへ送付する任意テンプレートメッセージを取得するため、<br>
以下3項目をLooker側で紐付けを行う。

- LINE WORKS ID
  - LINE WORKS Bot からLINE WORKSユーザに、LINEユーザ送信先リスト・LINEユーザ向け任意テンプレートメッセージを送付する際に必要な項目
  - LINE WORKS ID（例：xxxxx@org） に該当する dimension が、Explore 画面：フィールドピッカーで表示されている名称をペースト
- LINE ID
  - LINE WORKSユーザからLINEユーザに、任意テンプレートメッセージを送付する際に必要な項目
  - LINE ID（例：901000000011001） に該当する dimension が、Explore 画面：フィールドピッカーで表示されている名称をペースト
- LINE NAME
  - LINE WORKS BotからLINE WORKSユーザに、LINEユーザ送信先リスト・LINEユーザ向け任意テンプレートメッセージを送付する際に、[ボタンテンプレート](https://developers.worksmobile.com/jp/document/100500804?lang=ja)にてLINEユーザ名称を表示する際に必要な項目
  - LINE NAME（例：山田太郎） に該当する dimension が、Explore 画面：フィールドピッカーで表示されている名称をペースト

■Looker管理画面

![Looker管理画面_マッピング](https://github.com/ISID/looker-action-lineworks/blob/image/readme/Looker%E7%AE%A1%E7%90%86%E7%94%BB%E9%9D%A2_%E3%83%9E%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0.png)

#### 3. LookerのExplore画面でクエリ発行

Looker管理画面で`LINE WORKS ID` `LINE ID` `LINE NAME` に入力したExplore入力表示画面名称が、**必ずクエリ結果に含まれるように、該当するdimensionをExploreで選択**しクエリを発行。（その他項目は任意で追加してもOK）

以下は、Exploreでクエリ発行し表出力した際のイメージ図。

| LINE WORKS ID | LINE ID         | LINE ユーザ名 |
| :----------- | :-------------- | :------------ |
| xxxxx@org    | 901000000011001 | 山田太郎      |
| xxxxx@org    | 901000000011002 | 佐藤花子      |
| xxxxx@org    | 901000000011003 | 鈴木一郎      |
| yyyyy@org    | 901000000011001 | 山田太郎      |
| yyyyy@org    | 901000000011004 | 高橋雄一      |
| zzzzz@org    | 901000000011001 | 山田太郎      |

上記の場合、LINE WORKS連携Actionでは**LINE WORKS ID単位**で、LINE WORKS/LINEユーザ送信先リストおよび任意テンプレートメッセージを送信。

- xxxxx@org へ送付する、LINEユーザリスト
  - 山田太郎(901000000011001)、佐藤花子(901000000011002)、鈴木一郎（901000000011003）
- yyyyy@org へ送付する、LINEユーザリスト
  - 山田太郎(901000000011001)、高橋雄一（901000000011004）
- zzzzz@org へ送付する、LINEユーザリスト
  - 山田太郎(901000000011001)




## 6. LINE WORKS連携Actionの利用方法

LINE WORKSおよびLookerでの設定完了後、LINE WORKS連携Actionの主な利用方法は以下となります。

#### 1. Actionフォーム画面で設定

1. 6 章の[3. Looker の Explore 画面でクエリ発行](#3-lookerのexplore画面でクエリ発行)を行った Exploreから「送信」ボタンを押下し、Actionフォーム画面でLINE WORKS を選択
2. LINE WORKSユーザ向けのテンプレートメッセージ、LINEユーザ向けのテンプレートメッセージをそれぞれ入力して送信（リアルタイム配信）

![Looker_ActionForm](https://github.com/ISID/looker-action-lineworks/blob/image/readme/Looker_ActionForm.png)

#### 2. LINE WORKS連携Actionの送信方法

LINE WORKS連携Actionでは上記の「Explore 画面から即時送信」含め、Lookerデフォルト機能を用いた以下配信が可能です。

- リアルタイム配信：

  - Exploreでクエリ発行した内容を、LINE WORKS Botに即時配信することが可能です。
  - 例えば、以下のようなユースケースを想定しています。
    - 営業に顧客向けメッセージを送信指示したい場合に素早くレコメンド送信できます。

- スケジュール配信：

  - 指定した条件に合わせて、クエリ発行した内容をLINE WORKS Botに配信可能です。
  - 例えば、以下のようなユースケースを想定しています。
    - スケジュール配信単位でテンプレートメッセージを保存できるため、指定条件を変えずにテンプレートメッセージだけを簡単に変更することができます。
    - 顧客の誕生月や最終訪問時から 1 ヶ月後など、蓄積データのステータスをトリガーに、スケジュール配信を設定することも可能です。
    - 予定しているデータを最も必要としている人に、適切な頻度・適切なメッセージで送信することで、商機損失を防ぎます。

- アラート通知：

  - 指定した条件に合致した場合、クエリ発行した内容をLINE WORKS Botに即時送信可能です。
  - 例えば、以下のようなユースケースを想定しています。
    - 閾値を超過した際にメールアラートを設定すると、問題が発生したときでも顧客や現場ユーザへの連絡が簡単です。


## 7. 免責事項

本 OSS の使用により問題が生じた場合 および 不具合に対する対応責任は負いません。<br>
また、本 Readme で記載している設定方法および画面ショットは、以下バージョンでの記載・添付となります。<br>
バージョンアップに伴う本 Readme の更新作業や、各製品・ツールのバージョンアップ後の動作稼働担保は行いません。

・LINE WORKS（iOS 版）：2.8.0

・Looker：7.16
