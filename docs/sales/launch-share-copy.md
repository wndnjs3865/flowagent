# FlowAgent 출시 — 외부 노출 share copy

> 5개 채널별 게시 초안 + 게시 전략. 그대로 복사·붙여넣기 또는 본인 톤에 맞게 살짝 수정해서 사용.
> 작성: 2026-05-20. 출시: main `3107013`. 첫 글: [taskflow.kr/blog/2026-05-20-launch](https://taskflow.kr/blog/2026-05-20-launch).

## 게시 전략 한 줄

**한 채널씩, 24시간 간격, 응답 빠르게.** 모든 채널을 같은 날 동시 게시하면 응답 분산. 채널별 황금시간대(아래 표 참고)에 게시하고, 첫 1시간은 댓글·질문 즉시 응대 → engagement 곡선이 살아남.

| # | 채널 | 게시 황금 시간 (KST) | 핵심 톤 | 비고 |
|---|---|---|---|---|
| 1 | Hacker News (Show HN) | 23:00–01:00 (= 미국 동부 오전) | 객관적·기술 디테일 | front page 노출 = 큰 leverage |
| 2 | Reddit r/sideproject | 22:00–23:00 (= 미국 저녁) | 솔직·builder 톤 | 자기 PR 환영 sub |
| 3 | 디스콰이엇 | 평일 09:00–10:00 또는 19:00–21:00 | 페인 narrative + 자랑 톤 적당 | 한국 indie maker 메인 채널 |
| 4 | LinkedIn (한국어) | 평일 08:00–09:00 또는 12:00–13:00 | 비즈니스·professional | 사장·매니저 target |
| 5 | 지인 outreach 메일 | 평일 10:00–11:00 (출근 직후) | 친근·짧음 | warm intro lead funnel |

게시 순서 추천: **3 (디스콰이엇) → 1 (HN) → 2 (Reddit) → 4 (LinkedIn) → 5 (지인 outreach)**. 디스콰이엇이 가장 안전한 첫 게시(국내 indie maker가 너그러움), HN/Reddit이 가장 큰 leverage. LinkedIn은 잠재 Pilot lead, 메일은 warm intro.

---

## 1. Hacker News — Show HN

게시 URL: <https://news.ycombinator.com/submit>

**Title** (max 80 chars):
```
Show HN: FlowAgent – Local-first Korean SMB workflow orchestrator (Apache 2.0)
```

**URL**: `https://taskflow.kr`

**Text** (선택 — 보통 URL만 + 첫 댓글로 자기소개):
```
Hi HN — I built FlowAgent to help Korean SMB office workers automate their daily 
repetitive paperwork without sending company data to any cloud SaaS.

Why: Korean small/mid businesses use spreadsheets, Slack, and email all day for 
the same 5–8 tasks (meeting notes → action items, monthly sales CSV → executive 
summary, approval queue triage, customer inquiry classification, weekly progress 
report, plus quote/proposal/SNS replies for freelancers). Existing tools either 
require sending company data to a cloud SaaS (ChatGPT / Notion AI / domestic 
solutions like 자비스, 더존, flex) — which most Korean SMB CEOs explicitly refuse — 
or they're general workflow builders (n8n, Make, Zapier) that start from a blank 
page and have poor Korean-language fit.

What: 8 pre-built workflows shipped as plain YAML files. LLM calls (Anthropic 
Claude) happen directly from the user's laptop. Company data stays local under 
workflows/fixtures/. Non-developers start with start.bat — one double-click, 
3 minutes to first result. Apache 2.0 + separate trademark policy.

Tech: TypeScript, Hono, SSE streaming, single-machine single-user (no DAG, no 
queue). Built solo over the last 2 months while talking to ~15 Korean SMB 
owners about their daily friction.

Blog post: https://taskflow.kr/blog/2026-05-20-launch
Repo: https://github.com/wndnjs3865/flowagent

Happy to answer anything about the design decisions (why Apache 2.0 over BSL, 
why local-first over Cloud, why Korean SMB niche), the trade-offs of solo 
indie OSS, or the Korean B2B funnel reality.

— Joowon Kang (강주원), Seoul
```

게시 후 1시간: 댓글 즉시 응답. 부정적 코멘트(예: "왜 n8n 안 씀") 침착하게 facts 기반 응답. front page 진입 시 추가 2-3시간 모니터링.

---

## 2. Reddit r/sideproject

게시 URL: <https://www.reddit.com/r/sideproject/submit>

**Title**:
```
[Show] FlowAgent – Local-first Korean SMB workflow runner (8 prebuilt YAML workflows, Apache 2.0)
```

**Flair**: `Show` (or `OSS`)

**Body**:
```
Built for a specific niche I know well — Korean small business office workers 
who do the same 5–8 repetitive tasks daily and whose CEOs absolutely will not 
send company data to a cloud SaaS.

**What it does:**

8 pre-built workflows shipped as plain YAML. Read fixture file → LLM step 
(Anthropic Claude direct from laptop) → write result file. No cloud, no 
queue, no DAG. Single user, single machine.

- 5 core (admin/CEO focus): meeting actions, weekly report, sales summary, 
  inquiry triage, approval triage
- 3 freelancer (solo persona): quote email drafting, sales follow-up, 
  SNS reply classification with spam filter

**Why not just use [X]:**

- ChatGPT / Notion AI: cloud SaaS, Korean SMB CEOs explicitly refuse to send 
  company data
- n8n / Zapier / Make: poor Korean-language fit, blank-page start, no 
  workflow bundle for Korean office work
- Local LLMs (Ollama, LM Studio): great local-first, but no workflow assets

**Stack:**

TypeScript, Hono, SSE streaming, YAML + zod schema, single binary via tsx. 
~1500 LOC total. Built solo in ~2 months.

**Try it:**

- Website: https://taskflow.kr
- Repo: https://github.com/wndnjs3865/flowagent
- Blog post (longer write-up): https://taskflow.kr/blog/2026-05-20-launch

Honest about trade-offs — comments welcome.
```

게시 후 30분: upvote 5+ 되면 자동 비공개 해제 잘 됨. 댓글 빠른 응답.

---

## 3. 디스콰이엇

게시 URL: <https://disquiet.io/products/new>

**제목**:
```
FlowAgent — 회사 데이터를 노트북 밖으로 보내지 않는 한국어 사무 자동화 OSS
```

**카테고리**: 개발·OSS / 생산성·자동화

**본문**:
```
한국 중소기업 사무직, 1인 자영업, SMB 사장 — 매일 반복하는 사무업무를 
노트북 한 대에서 자동화하는 OSS 워크플로 러너입니다. 오늘 v0.1.0을 
공개했습니다.

🎯 누구를 위해

한국 SMB에서 일하는 친구·전 동료들이 매일 같은 푸념을 했어요.
"회의록 30분 정리하고 액션 추리느라 또 1시간."
"월말 매출 CSV 들여다보며 1-pager 만드는 데 반나절."
"결재함에 50건 쌓였는데 하나씩 읽고 판단."

ChatGPT·Notion AI·뤼튼·자비스·더존을 써보라고 권했더니 거의 모든 회사 
대표가 같은 말을 했어요: "우리 회사 데이터를 외부 클라우드에 보낼 수 
없어요."

🔑 차별점

- 회사 데이터가 노트북 밖으로 안 나감 (local-first, LLM 호출 직전까지 
  노트북 안)
- 한국어 사무 워크플로 8종 번들 (회의록·매출·결재·문의·주간보고 + 
  견적 메일·영업 후처리·SNS 답글)
- start.bat 더블클릭으로 비개발자도 5분 안에 첫 결과
- Apache 2.0 OSS + 별도 상표 정책

🧰 만든 사람

강주원 (서울, 사업자등록번호 607-20-94796). 솔로 2개월간 한국 SMB 
운영자 ~15명과 대화하며 만들었어요. 코드 ~1500줄 TypeScript + Hono + 
SSE 스트리밍.

🔗 링크

- 사이트: https://taskflow.kr
- 출시 글: https://taskflow.kr/blog/2026-05-20-launch
- 깃허브: https://github.com/wndnjs3865/flowagent

피드백·질문·"이런 워크플로 더 만들어줘요" 모두 환영합니다. 댓글에 
적어주시면 1시간 안에 답변드릴게요. Pilot 미팅 신청(4주 ₩500만, 
귀사 데이터로 워크플로 1개 같이 제작)도 환영.

GitHub Star 한 번씩 부탁드려요 🙏
```

게시 후 1시간: 댓글 모두 응답. 메이커 인사 댓글 빠른 회신.

---

## 4. LinkedIn (한국어, professional 톤)

게시 URL: <https://www.linkedin.com/feed/?shareActive=true>

**길이**: 약 200~250 한국어 단어 (LinkedIn 알고리즘이 짧은 글 + 1~2 hashtag 선호)

**본문**:
```
한국 중소기업 사무직의 매일 반복 페인을 줄이는 OSS를 오늘 공개했습니다 — 
FlowAgent.

회사 대표 분들과 이야기하면서 자주 들은 두 가지가 출발점이었습니다.

(1) "회의록 정리 → 액션 추출 → 보고서, 매월 같은 흐름인데 매번 30분~1시간."
(2) "AI 도구 좋아 보이는데, 우리 회사 데이터를 외부 클라우드에 보낼 수가 없어."

이 둘을 같이 푸는 도구는 한국 시장에 없었습니다. 그래서 만들었습니다.

→ 8개 한국어 사무 워크플로(회의록·매출·결재·문의·주간보고 + 견적·영업 
후처리·SNS 답글)가 미리 만들어져 있고,
→ 회사 데이터는 노트북 안에서만 처리되며,
→ start.bat 더블클릭으로 비개발자도 5분 안에 첫 결과를 봅니다.

Apache 2.0 오픈소스. Pilot 4주(귀사 데이터로 워크플로 1개를 같이 만드는 
컨설팅) 형태로도 진행합니다.

회의록·매출·결재·문의 등 "매일 비슷한 일을 한다"고 느끼는 SMB 운영자분이 
계시면 한 번 시도해보고 피드백 주시면 감사하겠습니다.

🔗 https://taskflow.kr
🔗 출시 글: https://taskflow.kr/blog/2026-05-20-launch

— 강주원 (FlowAgent / 사업자등록번호 607-20-94796)

#한국SMB #사무자동화 #오픈소스
```

게시 후 첫 시간: 동료·전 직장 동료 reactions 빠르게 → algorithm boost. 1차 반응 본 후 24시간 안에 댓글 응답.

---

## 5. 지인 outreach 메일 템플릿

> warm intro (가족·친구·전 직장 동료·창업 커뮤니티 etc) 중 한국 SMB 사무직·총무·운영매니저·대표·1인 자영업 분께 보낼 1:1 메일.

**Subject 후보 (A/B test 가능)**:
- "(소개) 매일 반복 사무 일 줄여주는 도구 하나 만들었어요"
- "FlowAgent — 한 번 봐주실 수 있을까요?"
- "[OOO 회사] 사무 자동화 도구 하나 만들었습니다"

**본문** (한국어, 200자 내외):
```
안녕하세요 [이름]님,

오랜만에 메일드립니다. 한국 중소기업 사무 자동화 도구 FlowAgent를 
만들어서 어제 v0.1.0을 공개했어요. [이름]님이 [근무 회사/직무] 쪽이라 
한 번 보여드리고 싶어 연락드립니다.

특히 [이 사람이 페인 가지고 있을 것 같은 워크플로 1~2개 — 예: 
"매월 매출 CSV로 보고서 만드는 일", "결재 대기함 분류"]에 도움이 
될 것 같아 한 번만 둘러봐 주실 수 있을까요?

회사 데이터는 노트북 밖으로 안 나가게 만들었고, 비개발자도 더블클릭 
2번으로 시작합니다. 

링크: https://taskflow.kr
출시 글(짧음): https://taskflow.kr/blog/2026-05-20-launch

피드백 한 줄(좋다·별로·이런 거 필요)이면 충분합니다. GitHub Star 
가능하시면 더 큰 도움이 됩니다 🙏

만약 [이름]님 회사에서 매일 반복하는 일 중 워크플로로 만들면 좋을 
케이스가 있으면, Pilot 4주(귀사 데이터로 같이 만들어드림, ₩500만) 
형태로도 진행 가능해요. 부담 없이 회신 주세요.

감사합니다.
강주원 드림.

—
강주원
FlowAgent / 사업자등록번호 607-20-94796
wndnjs3865@naver.com · https://taskflow.kr
```

발송 후 follow-up: D+5 영업일 무응답 시 "혹시 메일 못 보셨을까봐 한 번 더 드립니다" 짧은 단문 follow-up 1회. D+10 무응답이면 종료 (스팸 신고 risk 회피).

---

## 게시 후 24시간 점검 항목

- [ ] HN 댓글 응답률 100% (negative 포함)
- [ ] Reddit upvote 5+ 확인 (1시간 안에 안 되면 flair·title 조정 후 재시도)
- [ ] 디스콰이엇 메이커 인사 댓글 모두 응대
- [ ] LinkedIn reactions·댓글 응답
- [ ] 지인 메일 답장 즉시 회신 (Pilot 가능성 lead로 분류)

## KPI 점검 (M1 — 2026-06-11 deadline)

- GitHub stars 30 (출시 시점 0) → 22일 안에 30 달성?
- waitlist 50 (출시 시점 0) → 22일 안에 50 달성?

채널별 lead 출처는 site의 EmailForm source 파라미터로 트래킹: `solo-updates`, `blog-waitlist`, `templates-waitlist` 등. 외부 노출 후 사이트 traffic 급증하면 어느 채널에서 가장 큰 영향인지 확인.

## 변경·갱신 가이드

본 share copy는 v0.1.0 출시 기준. v0.2.0 (예: Cloud 호스팅 추가 또는 신규 워크플로) 시점에 갱신:
- 본문의 "8 워크플로" 숫자 변경
- 새 차별점 / 기능 추가
- HN/Reddit 등은 같은 제목 재게시 금지 (모더레이션 risk) — 다른 angle로 재작성
