# FlowAgent Pilot — target tracker

> 첫 batch 10곳 콜드/웜 outreach 진행 트래커. 짝 문서: [`pilot-onepager.md`](./pilot-onepager.md) (첨부 PDF), [`pilot-outreach-email.md`](./pilot-outreach-email.md) (메일 템플릿).
> 5건 이상 누적되면 Notion/Sheets로 이관 권장 — 이 파일은 그 직전까지의 작업 메모이자 스키마 정의.

## 발굴 가이드 (어디서 누구를)

### 페르소나 × 추천 업종 (FlowAgent 5종 워크플로우 기준)

| 워크플로우 | 페르소나 | 페인이 큰 업종 (가설) | 첫 컨택 시 강조 포인트 |
|---|---|---|---|
| `weekly-report-demo` | manager | 모든 SMB 운영팀 | "매주 비슷한 양식 다시 쓰는 시간" |
| `meeting-actions` | manager | 컨설팅·에이전시·리서치 (회의 多) | "회의록 → 액션아이템 자동 추출" |
| `sales-summary` | finance/sales | 이커머스·유통·D2C (매출 CSV 매월) | "월말 매출 1-pager 자동 생성" |
| `inquiry-triage` | cs | B2C SaaS·이커머스·교육 CS팀 | "문의 카테고리·긴급도 분류 + 답변 초안" |
| `approval-triage` | finance/operations | 보험·금융·중견 제조 (결재 多) | "결재 요청 검토 + 보류/통과 사유 정리" |

### 발굴 채널 (응답률 가설 高 → 低)

1. **지인 소개 (warm intro)** — 응답률 30–50% 추정. 가족·친구·전 동료 중 10–200인 회사 사무·운영팀에 있는 사람부터.
2. **LinkedIn 검색** — `operations manager`, `사무팀장`, `운영매니저`, `CS팀장` 키워드 + 한국 + 회사 규모 11–200. InMail 또는 회사 일반 메일.
3. **잡코리아·원티드·로켓펀치 채용공고** — "운영매니저" "사무관리" 채용 중인 회사는 그 업무 페인이 큼. 채용공고에서 회사명·이메일 추출.
4. **사라모임·디스콰이엇 등 커뮤니티** — SMB 창업자·운영자 분포 高. 직접 영업보다 콘텐츠로 노출 후 인바운드.
5. **지역 상공회의소·중소기업진흥공단 입주사 명단** — 공개 명단에서 추출. 응답률 낮지만 명단 大.
6. **이미 SaaS 결제 중인 회사** — Zapier·n8n 한국 사용자 모임, Notion·Slack 한국 워크스페이스. "이미 자동화 의지 있음"이 검증된 모집단.

### 1차 batch 발굴 기준 (10곳)

- 규모: 10–200인 (사업계획서 타겟)
- 위치: 한국 (영업·미팅 KST)
- 우선: 지인 소개 3–5곳 + 콜드 5–7곳 믹스 (지인이 응답률 끌어올려서 데이터 확보)
- 페르소나는 가급적 5종 워크플로우 전부 한 번씩 커버하도록 다양화 → 어떤 워크플로우가 가장 잘 먹히는지 첫 라운드에서 학습

## 상태 enum

| 상태 | 의미 | 이메일 템플릿 변형 |
|---|---|---|
| `planned` | 리스트에만 있음, 담당자·이메일 미확정 | — |
| `researched` | 담당자명·이메일 확인 완료, 발송 대기 | — |
| `sent` | 1차 outreach 메일 발송 | 기본 본문 |
| `follow-up` | 발송 5영업일 무응답 → 단문 follow-up 발송 | "Follow-up" 변형 |
| `replied` | 회신 옴 (일정 조율 중) | — |
| `meeting-set` | Google Meet 일정 확정 | — |
| `demoed` | 1차 30분 데모 완료, 사례 1건 같이 작성 | "설치 미팅 제안" 변형 |
| `pilot-signed` | Pilot 4주 계약 체결 | — |
| `closed-lost` | 거절·N차 무응답 (3회 시도 후 종료) | — |

## 타겟 리스트 (첫 batch 10곳)

> 채워넣기: 회사명·담당자·이메일은 발굴 후 직접 입력. `(채워넣기)` 칸은 발굴 전 placeholder.

| # | 회사명 | 업종 / 규모 | 추천 워크플로우 | 담당자 / 이메일 | 채널 | 발신일 | 상태 |
|---|---|---|---|---|---|---|---|
| 1 | (채워넣기) | (예: SaaS / 30–50인) | weekly-report-demo | (담당자명 / 이메일) | warm-intro | — | planned |
| 2 | (채워넣기) | (예: 이커머스 / 50–100인) | sales-summary | (담당자명 / 이메일) | warm-intro | — | planned |
| 3 | (채워넣기) | (예: 컨설팅 / 20–40인) | meeting-actions | (담당자명 / 이메일) | warm-intro | — | planned |
| 4 | (채워넣기) | (예: 교육 SaaS / 30–60인) | inquiry-triage | (담당자명 / 이메일) | LinkedIn | — | planned |
| 5 | (채워넣기) | (예: 중견제조 자회사 / 100–200인) | approval-triage | (담당자명 / 이메일) | LinkedIn | — | planned |
| 6 | (채워넣기) | (예: D2C 브랜드 / 20–50인) | sales-summary | (담당자명 / 이메일) | LinkedIn | — | planned |
| 7 | (채워넣기) | (예: B2C 앱 / 40–80인) | inquiry-triage | (담당자명 / 이메일) | 채용공고 | — | planned |
| 8 | (채워넣기) | (예: 에이전시 / 15–30인) | meeting-actions | (담당자명 / 이메일) | 채용공고 | — | planned |
| 9 | (채워넣기) | (예: SaaS / 50–100인) | weekly-report-demo | (담당자명 / 이메일) | 커뮤니티 | — | planned |
| 10 | (채워넣기) | (예: 핀테크 / 30–80인) | approval-triage | (담당자명 / 이메일) | 커뮤니티 | — | planned |

## 발신 후 follow-up 룰

1. **D+0 (발신일)** — `sent` 상태로 변경, 발신일 기록.
2. **D+2 (영업일)** — 응답 확인. `replied`면 일정 조율 → `meeting-set`.
3. **D+5 (영업일)** — 무응답이면 [pilot-outreach-email.md](./pilot-outreach-email.md) "Follow-up 변형" 단문 1회 발송, `follow-up` 상태로.
4. **D+10 (영업일)** — 그래도 무응답이면 `closed-lost`. 추가 발송은 하지 않음 (스팸 신고 위험 회피).
5. **회신 거절** — 즉시 `closed-lost`. 거절 사유는 행 아래 메모에 1줄 기록 ("가격" / "타이밍" / "이미 다른 도구" / "권한 없음" 중 하나로 분류).

## 주간 결산 (매주 금요일 15:00 KST)

이 파일 하단 "주간 로그" 섹션에 한 줄씩 누적. 의사결정 트리거:

- **응답률 < 5%** → 발굴 채널 또는 본문 톤 재조정. 다음 batch 발송 전 [pilot-outreach-email.md](./pilot-outreach-email.md) subject·1문단 수정.
- **응답률 ≥ 10% 이고 meeting-set ≥ 2건** → 추가 batch 10곳 발굴 진행.
- **demoed ≥ 1건** → 해당 회사 피드백 기반 [pilot-onepager.md](./pilot-onepager.md) 가격·일정 섹션 업데이트 검토.
- **pilot-signed ≥ 1건** → 6번째 실무 워크플로우 발굴 시작 (사업계획서 `4-6주 목표` 진입 신호).

## 주간 로그

> 형식: `YYYY-MM-DD (요일) | sent N / replied N / meeting-set N / demoed N / pilot-signed N | 메모`

- 2026-05-11 (월) | sent 0 / replied 0 / meeting-set 0 / demoed 0 / pilot-signed 0 | 트래커 셋업, 첫 batch 발굴 시작

## 수정 포인트 (사용자가 조정할 항목)

- 발굴 채널 우선순위 — 본인 네트워크에서 warm-intro 풀이 크면 1번 채널 비중을 6–7곳까지 올림.
- 업종 가설 — 위 "페르소나 × 추천 업종" 표는 가설. 1차 batch 응답으로 검증 후 갱신.
- D+5 / D+10 텀 — 한국 SMB 의사결정 속도 따라 더 길어질 수 있음. 첫 라운드 데이터로 보정.
