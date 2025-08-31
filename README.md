# Disposable Income Tax Calculator

React + Vite + Tailwind app that mirrors your Python tax calculator and shows tax, net income, and effective/marginal rates.

## Local dev
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages (Actions)
1. Create an empty GitHub repo (public or private).
2. Push this project to the repo's `main` branch.
3. In **Settings → Pages**, set:
   - Source: **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds and deploys on each push to `main`.
5. Your site URL will appear in the Actions log (and under Settings → Pages).

> If you use a **project** page (user.github.io/**repo**), we set `base: './'` in `vite.config.ts` so assets resolve correctly.