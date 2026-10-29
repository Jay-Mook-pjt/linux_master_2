# 📚 나의 공부 노트 — GitHub Pages 템플릿

개념 정리(가이드) + 객관식 문제 + OX + 오답노트 + 북마크가 들어있는 정적 사이트 템플릿이에요.
서버 없이 **GitHub Pages**로 무료 배포할 수 있고, 내용은 **Markdown과 간단한 데이터 파일**만 고치면 됩니다.

---

## 📁 폴더 구조 — 어떤 파일을 고치면 되나요?

```
my-study-site/
├── config.js          ✏️ 사이트 제목, 작성자, 챕터 목록, 업데이트 내역
├── content/           ✏️ 가이드 본문 (챕터 1개 = .md 파일 1개)
│   ├── ch01.md           (작성 예시 모음 — 먼저 읽어보세요)
│   ├── ch02.md
│   └── ch03.md
├── data/
│   ├── quiz.js        ✏️ 객관식 문제
│   └── ox.js          ✏️ OX 문제
├── index.html         (공유 미리보기용 제목/설명만 가끔 수정)
├── assets/
│   ├── style.css      🎨 디자인 (맨 위 색상 변수만 바꿔도 분위기 변경)
│   └── app.js         ⚙️ 동작 코드 (보통 안 건드려도 됨)
└── .nojekyll          (지우지 마세요! GitHub가 .md 파일을 그대로 보내주게 하는 표시)
```

---

## 1️⃣ 처음 한 번만: 준비하기

### ① 프로그램 설치
- **Git**: https://git-scm.com → 다운로드 후 기본 옵션으로 설치
- **VS Code**: https://code.visualstudio.com
- VS Code 실행 → 왼쪽 확장(□ 네 개 아이콘) → **Live Server** 검색 후 설치
  (이 폴더를 열면 "추천 확장 설치" 알림이 뜨기도 해요)

### ② Git에 내 이름 등록 (터미널에서 한 번만)
VS Code 메뉴 **터미널 → 새 터미널** 을 열고:
```bash
git config --global user.name "내이름"
git config --global user.email "github에 가입한 이메일"
```

### ③ GitHub에 빈 저장소 만들기
1. github.com 로그인 → 오른쪽 위 **+ → New repository**
2. Repository name: 예) `linux-study` (→ 주소가 `https://아이디.github.io/linux-study/` 가 돼요)
3. **Public** 선택
4. ⚠️ "Add a README file" 은 **체크하지 마세요** (빈 저장소로 만들어야 충돌이 없어요)
5. **Create repository**

### ④ 이 폴더를 GitHub에 올리기
1. 압축을 풀고 VS Code에서 **파일 → 폴더 열기** 로 `my-study-site` 폴더 열기
2. 새 터미널을 열고 아래를 한 줄씩 실행 (아이디/저장소 이름은 내 것으로!)

```bash
git init
git add .
git commit -m "첫 커밋: 사이트 템플릿"
git branch -M main
git remote add origin https://github.com/아이디/linux-study.git
git push -u origin main
```

> 처음 push 할 때 브라우저가 열리며 GitHub 로그인을 요청해요. 로그인/허용하면 끝.

### ⑤ GitHub Pages 켜기
1. GitHub 저장소 페이지 → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **/(root)** → **Save**
4. 1~2분 뒤 새로고침하면 위쪽에 사이트 주소가 나와요 🎉

---

## 2️⃣ 매일 하는 일: 내용 쓰고 올리기

### ① 미리보기 켜기
VS Code에서 `index.html` 을 열고 **오른쪽 아래 "Go Live"** 클릭 (또는 파일에서 우클릭 → Open with Live Server)
→ 브라우저가 열리고, 파일을 저장할 때마다 **자동 새로고침**돼요.

> ⚠️ `index.html` 을 그냥 더블클릭하면 챕터가 안 보여요 (브라우저 보안 정책). 꼭 Live Server로 여세요.

### ② 내용 수정
| 하고 싶은 것 | 고칠 파일 |
|---|---|
| 사이트 제목, 소개글, 작성자 | `config.js` |
| 가이드 글 쓰기 | `content/ch01.md` … |
| 새 챕터 추가 | `content/ch04.md` 만들고 → `config.js` 의 `chapters` 에 한 줄 추가 |
| 객관식 문제 추가 | `data/quiz.js` 에서 문제 하나를 복사·붙여넣기 후 수정 |
| OX 문제 추가 | `data/ox.js` |
| 색상 바꾸기 | `assets/style.css` 맨 위 `--accent` 등 |
| 카톡 공유 미리보기 | `index.html` 위쪽 `<title>`, `og:` 태그 |

### ③ GitHub에 올리기 (= 사이트에 반영)
```bash
git add .
git commit -m "ch04 챕터 추가"
git push
```
1분 정도 뒤 사이트에 반영돼요.

> 💡 터미널이 귀찮다면: VS Code 왼쪽 **소스 제어(가지 모양 아이콘)** → 메시지 입력 → **✓ 커밋** → **변경 내용 동기화** 버튼으로도 똑같이 할 수 있어요.

---

## ✍️ 글쓰기 문법 요약 (`content/*.md`)

| 쓰는 법 | 결과 |
|---|---|
| `## 제목` | 챕터 제목 (목차·첫 화면 카드에 표시) |
| `### 제목` | 소제목 (목차에 들여쓰기) |
| `**굵게**` | 초록색 굵은 글씨 |
| `` `코드` `` | 인라인 코드 |
| ` ```bash ` … ` ``` ` | 터미널 창 모양 코드 박스 (+복사 버튼) |
| `> [!TIP] 제목` | 초록 팁 박스 (`NOTE`, `WARNING`, `IMPORTANT`, `DANGER` 도 가능) |
| `\| 표 \| 머리 \|` | 표 |
| `## 제목 {#my-id}` | 주소를 `#my-id` 로 지정 (안 쓰면 `#sec-1`, `#sec-2` … 자동) |

자세한 예시는 `content/ch01.md` 를 보세요.

## 📝 문제 추가 예시 (`data/quiz.js`)

```js
  {
    id: "q6",                       // 겹치지 않게! 한 번 정하면 바꾸지 않기
    category: "기본 명령어",
    question: "현재 위치를 출력하는 명령어는?",
    choices: ["ls", "pwd", "cd", "mkdir"],
    answer: 2,                      // 1부터 셈 (②번)
    explanation: "`pwd` = print working directory",
  },
```

---

## ❓ 자주 생기는 문제

- **챕터가 "불러오지 못했어요" 라고 나와요** → Live Server로 열었는지, `config.js` 의 파일 경로와 실제 파일 이름이 같은지 확인
- **화면이 하얗게 나오고 아무것도 안 떠요** → `data/quiz.js` 에서 쉼표(`,`)나 따옴표가 빠진 경우가 대부분. 브라우저에서 F12 → Console 탭의 빨간 에러 확인
- **push 했는데 사이트가 안 바뀌어요** → 1~2분 기다린 뒤 Ctrl+Shift+R(강력 새로고침). 저장소의 **Actions** 탭에서 배포 진행 상황을 볼 수 있어요
- **push 할 때 `rejected` 에러** → GitHub에서 직접 파일을 고친 적이 있으면 `git pull` 먼저 한 뒤 다시 `git push`
- **북마크/풀이 기록은 어디 저장돼요?** → 각 방문자의 브라우저(localStorage)에만 저장돼요. 같은 `아이디.github.io` 아래에 사이트를 여러 개 만들면 `config.js` 의 `storageKey` 를 사이트마다 다르게 해주세요
