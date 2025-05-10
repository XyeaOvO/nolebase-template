```bash
# 0. 确保已备份重要代码，并已删除 .git 文件夹

# 1. 重新初始化 Git 仓库，并将默认分支设置为 main
git init -b main

# 2. 添加所有文件到暂存区
git add .

# 3. 进行第一次提交
git commit -m "初始提交"

# 4. 关联远程仓库 (替换 URL)
git remote add origin <你的远程仓库URL>

# 5. 强制推送到远程仓库的 main 分支
git push -u --force origin main
```