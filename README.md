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
