# Prompt Studio 日本語マニュアル

Prompt Studio は、Draw Things 向けの画像生成プロンプトを **保管・整理・編集・一括出力**するためのローカルHTMLツールです。

主な想定ワークフローは次の通りです。

```text
Grok / Claude / ChatGPT などで複数プロンプトを作成
        ↓
Assist で自動分割・1行化・Group登録
        ↓
Groups で確認・推敲・順番整理・差分保存
        ↓
Library の単語集を使って補強
        ↓
Compose / Draw Things 用スクリプトへコピー
```

データは基本的にブラウザの `localStorage` に保存されます。サーバーへ自動送信されるものではありません。

---

## 1. 起動方法

`prompt_studio.html` をブラウザで開きます。

```text
file:///path/to/prompt_studio.html
```

ビルドやインストールは不要です。

---

## 2. 画面構成

Prompt Studio には主に5つの画面があります。

| 画面 | 用途 |
|---|---|
| Library | 単語・タグの保管庫。カテゴリ分け、検索、翻訳、仕分けに使います。 |
| Compose | Library の単語を選んでプロンプトを組み立てます。Draw Things 用スクリプト形式へ出力できます。 |
| Groups | 複数の完成プロンプトをグループ単位で管理します。ストーリー、紙芝居、連続生成向きです。 |
| Assist | AIが作った長文プロンプト群の取り込み、自動分割、1行化、圧縮、Group登録を行います。 |
| Settings | AIバックエンドなどの設定を行います。 |

ショートカット:

| 操作 | キー |
|---|---|
| Libraryへ移動 | Option + 1 |
| Composeへ移動 | Option + 2 |
| Groupsへ移動 | Option + 3 |
| Assistへ移動 | Option + 4 |
| Settingsへ移動 | Option + 5 |

---

## 3. 基本ワークフロー

### 3.1 AIが作った複数プロンプトを取り込む

Grok / Claude / ChatGPT などで、以下のような複数プロンプトを作った場合は **Assist** を使います。

```text
Prompt 1（日常シーン）
Positive
masterpiece, best quality, 1girl, city street, smiling

Prompt 2（休憩シーン）
Positive
masterpiece, best quality, 1girl, park bench, relaxed
```

手順:

1. **Assist** を開く
2. AI生成プロンプト貼り付け欄に貼る
3. 必要なら追加先Groupを選ぶ、または新規Group名を入力
4. 自動分割・1行化・Group登録を実行

補足:

- `Prompt 1`, `Prompt 2` のような見出しを検出します。
- `Positive` だけの行は本文から除外されます。
- 形式が崩れている場合は、空行を多めに入れて手動で分割しやすくしてください。

---

## 4. Library の使い方

Library は、プロンプト用の単語・タグを蓄積する場所です。

### 4.1 タグを登録する

単語や短いフレーズを登録できます。

例:

```text
best quality
wet clothes
looking at viewer
soft lighting
```

### 4.2 カテゴリ

タグはカテゴリに分類できます。

代表的なカテゴリ:

| カテゴリ | 例 |
|---|---|
| quality | masterpiece, best quality |
| character | 1girl, solo, tomboy |
| clothes | oversized shirt, school uniform |
| clothes/expression | wet clothes, torn clothes, clothes slipping |
| emotion | happy, embarrassed, serious |
| pose/expression | sitting, standing, looking back |
| background | city street, park, bedroom |
| camera/angle | close-up, low angle |
| style/technique | cel shading, matte anime style |

### 4.3 clothes と clothes/expression の考え方

- **clothes**: 恒常的な服装・衣装そのもの  
  例: oversized hoodie, school uniform

- **clothes/expression**: 服の状態・変化・ニュアンス  
  例: wet clothes, torn clothes, clothes covered in dust

「大きな服」は服そのものなので `clothes`、  
「濡れた服」は状態変化なので `clothes/expression` という扱いです。

---

## 5. Compose の使い方

Compose は、Library のタグを選んでプロンプトを組み立てる画面です。

### 5.1 プロンプトを組み立てる

1. カテゴリや検索でタグを探す
2. 必要なタグを選択
3. 出力欄にプロンプトを生成
4. コピーして Draw Things へ貼り付け

### 5.2 スクリプト化せずコピー

選択したプロンプト群を、Draw Things 用スクリプトではなく、単純なプロンプト本文としてコピーすることもできます。

この場合、最後に `,` を付けた形式でコピーできます。

---

## 6. Groups の使い方

Groups は、完成済みの1行プロンプトをまとめて管理する場所です。

特に以下の用途に向いています。

- ストーリー仕立ての紙芝居
- 連続した日常シーン
- キャラ別・場面別のプロンプト保管
- Draw Things のバッチ生成用プロンプト管理

### 6.1 Groupを作る

Assist から登録するか、Groups 画面で新規Groupを作成します。

例:

```text
Barbu 日常編
仕事中の様子
プライベート
ラーメン屋シーン集
```

### 6.2 プロンプトの順番変更

Group内のプロンプトはドラッグで順番変更できます。

順番編集時は、元の番号が `#1`, `#2`, `#3` のように一時表示されます。

これは「元々何番だったプロンプトが、今どこに移動したか」を分かりやすくするためです。

編集を確定すると、上から順に番号が振り直されます。

### 6.3 複数選択して Compose へ送る

Group内、または複数Groupをまたいでプロンプトを選択し、Composeへ送れます。

重要:

- Composeへ送る順番は **選択した順番** です。
- ストーリー生成では、意図した順にチェックしてください。

### 6.4 画像サイズを指定して送る

各プロンプトの横で、一時的な画像サイズを指定できます。

例:

```text
704x832 | prompt text
1024x1536 | prompt text
```

これは Draw Things 用バッチスクリプトで、プロンプトごとにサイズを変えるための形式です。

Groupに保存されている元プロンプトは変更されません。

---

## 7. Groups の検索・置換

Groups ではプロンプト内の単語を検索できます。

### 7.1 検索

検索欄に単語を入れると、該当部分がハイライトされます。

例:

```text
expression
realistic
best quality
```

検索ヒットへ移動するボタンもあります。

### 7.2 頻出検索語

よく使う検索語はプルダウンに登録できます。

操作:

| 操作 | 内容 |
|---|---|
| 検索語を追加 | 現在の検索欄の内容を頻出検索語として保存 |
| 選択検索語を上書き | プルダウンで選んだ検索語を、現在の検索欄の内容で上書き |
| 選択検索語を削除 | プルダウンで選んだ検索語を削除 |

保存先はブラウザの `localStorage` です。

### 7.3 置換

選択したプロンプトに対して、一括置換できます。

例:

```text
realistic → best quality
```

置換欄を空にすると、検索語を削除できます。

### 7.4 差分として保存

直接上書きせず、置換後のプロンプトを **差分として新規保存**できます。

元のプロンプトを残したまま、編集後バージョンを追加したい時に使います。

---

## 8. Groups の Library Palette

Groups 内には Library Palette があります。

これは、Library のタグを見ながら Groups のプロンプトを編集するための補助パネルです。

### 8.1 展開・折りたたみ

右上の **展開 / 閉じる** ボタンで表示を切り替えられます。

画面を広く使いたい時は閉じておくと便利です。

### 8.2 タグ検索

Library Palette 内で単語を検索できます。

カテゴリで絞り込むこともできます。

### 8.3 編集中プロンプトへ挿入

タグを選択して **編集中へ挿入** を押すと、現在編集中のプロンプトへ挿入されます。

編集中プロンプトがない場合は、選択タグがクリップボードにコピーされます。

### 8.4 表示語をコピー

検索・カテゴリで絞り込まれて下に表示されている単語を、まとめてコピーできます。

コピー形式:

```text
tag1, tag2, tag3
```

Draw Things に直接貼り付けたい時に便利です。

### 8.5 Groupへ新規追加

選択したLibraryタグをまとめて、現在のGroupへ新規プロンプトとして追加できます。

---

## 9. プロンプトの個別編集・差分保存

Groups の各プロンプトは個別に編集できます。

主な操作:

| 操作 | 内容 |
|---|---|
| 編集 | プロンプト本文を直接編集 |
| TITLE編集 | プロンプトのタイトルを編集 |
| 保存 | 元のプロンプトを上書き |
| 差分として保存 | 元を残して、編集後を新規プロンプトとして保存 |

「元も残しておきたい」場合は、差分として保存を使うのがおすすめです。

---

## 10. AI文体Cleaner

AIが書いたプロンプトは、説明文に近くなりすぎることがあります。

例:

```text
A beautiful young woman is standing in a softly lit room, wearing...
```

AI文体Cleaner は、こうした冗長な文章を、画像生成向けの短いタグ列へ圧縮するための機能です。

例:

```text
1girl, standing, softly lit room, elegant outfit, calm expression
```

---

## 11. エクスポート / インポート

Prompt Studio のデータは JSON として書き出し・読み込みできます。

### 11.1 エクスポート

Libraryタグ、カテゴリ、Groupsなどをバックアップできます。

### 11.2 インポート

読み込み時には、必要に応じて以下を選べます。

| モード | 内容 |
|---|---|
| 両方 | tags と groups の両方を読み込む |
| tagsのみ | Libraryタグだけ読み込む |
| groupsのみ | Groupsだけ読み込む |

古いJSONと新しいJSONをサルベージする時に便利です。

---

## 12. Draw Things 用スクリプトとの連携

付属の Draw Things 用スクリプトは、複数プロンプトを連続実行できます。

対応形式:

```text
prompt text
```

またはサイズ付き:

```text
704x832 | prompt text
1024x1536 | prompt text
```

### 12.1 サイズ付きプロンプト

`WIDTHxHEIGHT | prompt` の形式で書くと、プロンプトごとに生成サイズを変えられます。

例:

```text
704x832 | masterpiece, best quality, 1girl, city street
1536x1024 | masterpiece, best quality, landscape, sunset
```

### 12.2 Inpaint mode の注意

Inpaint mode では、現在のキャンバス画像とマスクを使い回します。

そのため、プロンプトごとのサイズ指定は無効です。  
サイズ指定行がある場合はエラーになります。

---

## 13. よくある使い方

### 13.1 AIが出した複数プロンプトを一括登録したい

1. Assist に貼り付け
2. 自動分割
3. 1行化
4. Groupを選択、または新規作成
5. Groupへ登録

### 13.2 Group内の `realistic` を削除したい

1. Groupsで対象プロンプトを選択
2. 検索欄に `realistic`
3. 置換欄を空欄にする
4. 選択中に適用、または置換→差分保存

### 13.3 `expression` が入っているプロンプトを探したい

1. Groups検索欄に `expression`
2. 次へ / 前へ で該当箇所へ移動
3. 必要なら編集

### 13.4 Library の単語を見ながら Group プロンプトを編集したい

1. Groupsで対象プロンプトを編集
2. Library Paletteを展開
3. タグ検索
4. タグを選択
5. 編集中へ挿入

### 13.5 検索結果の単語をそのまま Draw Things に貼りたい

1. GroupsのLibrary Paletteを展開
2. 単語検索、またはカテゴリ選択
3. **表示語をコピー**
4. Draw Thingsへ貼り付け

---

## 14. バックアップのすすめ

データは `localStorage` に保存されるため、ブラウザのデータ削除や別ブラウザへの移行で消える可能性があります。

大事なデータが増えたら、定期的に JSON エクスポートしてください。

おすすめ:

```text
作業後にエクスポート
大きく編集する前にエクスポート
GitHub公開用とは別に個人用バックアップを保存
```

---

## 15. 注意事項

- このツールはローカルHTMLとして動作します。
- データは主にブラウザの `localStorage` に保存されます。
- AI翻訳・仕分け・Cleaner などは、設定したバックエンドが必要です。
- Ollamaを使う場合は、Ollama側でモデルが利用可能な状態にしておく必要があります。
- Draw Things用スクリプトは、Draw Thingsアプリ内で実行します。

---

## 16. 推奨運用

このツールは、完成済みプロンプトをただ保存するだけでなく、以下のように使うと強いです。

1. AIに場面別プロンプトを書かせる
2. Assistで取り込む
3. Groupsで順番を整える
4. Library Paletteで単語を補強する
5. 差分保存でバリエーションを増やす
6. Composeへ送る
7. Draw Thingsでバッチ生成する

特に、ストーリー仕立て・紙芝居・連続動画用のプロンプト管理に向いています。
