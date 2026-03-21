# Coo Note

音声・動画ファイルから波形を生成し、PNG として書き出す Web アプリです。

## 開発

依存関係は **pnpm** で管理します。

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## GitHub へ公開する

リポジトリは [mizushima1226](https://github.com/mizushima1226) 上に作成して push します。

1. **GitHub CLI** で `mizushima1226` アカウントにログインしていることを確認します（別アカウントのままだと作成できません）。

   ```bash
   gh auth status
   gh auth login -h github.com
   ```

2. プロジェクト直下で、空のリポジトリを作ってそのまま push します。

   ```bash
   cd /path/to/coo-note
   gh repo create coo-note --public --source=. --remote=origin --push
   ```

   すでに `origin` が設定されている場合は、GitHub 上で空の `coo-note` リポジトリを作成したうえで次を実行します。

   ```bash
   git push -u origin main
   ```

## GitHub Pages でホスティング

**可能です。** `main` へ push すると GitHub Actions が `dist` をビルドして公開します（静的サイトのみ）。

- 公開 URL（リポジトリ名が `coo-note` の場合）: **https://mizushima1226.github.io/coo-note/**

### 初回の必須設定（これがないと deploy が失敗します）

ビルド（`build` ジョブ）は成功しても、**GitHub Pages の公開元が「GitHub Actions」になっていない**と、`deploy` ジョブで次のようなエラーになります。

- `HttpError: Not Found`
- `Failed to create deployment (status: 404)`
- `Ensure GitHub Pages has been enabled`（ログに表示される案内）

対処は **リポジトリの Pages 設定でソースを切り替える**ことです。

1. **[Settings → Pages](https://github.com/mizushima1226/coo-note/settings/pages)** を開く
2. **Build and deployment** の **Source** を、デフォルトの **Deploy from a branch** ではなく **GitHub Actions** に変更する  
   （ドロップダウンから **GitHub Actions** を選ぶ）

保存後、**Actions** タブで失敗したワークフローを **Re-run failed jobs** するか、`main` に空コミットを push して再実行してください。

以降は `main` への push だけで自動デプロイされます。

### ローカルで Pages 用ビルドを試す

```bash
VITE_BASE=/coo-note/ pnpm build
pnpm preview
```

（`preview` はルート配下のため、実際の Pages とパスは異なります。本番相当は Actions のログで確認してください。）
