# Spec — FlowAgent 정체성 재정의 (Phase 1)

> Status: **DRAFT — 사용자 검토 대기**
> 작성일: 2026-05-14
> 이전 spec: [docs/specs/0001-local-workflow-runner.md](../../specs/0001-local-workflow-runner.md) (MVP, 구현 완료)
> 결정 근거: 5번의 시장·경쟁·실행성 deep-dive (conversation context)

---

## Summary

FlowAgent는 한국 SMB의 반복 사무업무를 노트북 안에서 자동화하는 도구다. 5종 한국어 워크플로(회의록·매출·결재·문의·주간보고)와 start.bat 비개발자 진입을 자산으로 가지고 있으며, 이번 재정의의 목적은 **(a) 누구를 위한 도구인지 명확히 좁히고**, **(b) 단일 차별점으로 영업·마케팅 메시지를 통일하고**, **(c) 현 자산을 재설계 최소로 시장에 출시**하는 것이다.

핵심 결정 3개:
- **타겟 = SMB 사무직(A) + 1인 자영업(B) + SMB 사장(D) 카탈로그 모델** (전문직 사무소 vertical은 점령자 강고로 제외)
- **공통 차별점 = "회사 데이터가 노트북 밖으로 안 나가는 한국어 사무 자동화"** (Local-first + 한국어)
- **출시 전략 = 3 페르소나 동시 출시** (B 신규 3종 구현 4~6주 후)

---

## 변경 이유 (5번 조사가 가르쳐 준 것)

| 조사 | 핵심 발견 |
|---|---|
| 1차 wide-scan | 한국 SaaS 시장 점령됨. 보안+rework 종식 가설 등장 |
| 2차 A사분면 verify | 전문직 사무소(세무·노무·법무·의료)는 2024-2025 사이 슈퍼로이어·솔로몬랩스·세나클·flex 등이 채움 — **닫혔다** |
| 3차 Cross-vertical | 공공·공기업·K-LLM 컨소시엄(5팀)도 점령. N2SF로 망분리 차별점도 약화 |
| 4차 A안 OSS+컨설팅 | K-LLM 파트너십 트랙은 닫힘. 한국 솔로 OSS SaaS ARR ₩1B 사례 0건 |
| 5차 C-4 하이브리드 | 수학적으로 가능, 확률 30%, 가중 평균 ARR ₩1.85억/36개월. 6가지 작동 조건 필요 |

**결론**: 큰 SaaS 시장은 없다. 솔로 운영 + 한국어 자산 + 좁힌 페르소나 + 명확한 단일 차별점이 유일한 길. 1번 고객까지의 최단 경로가 정체성 정의의 진짜 목적이며, 시장 점령은 100번째 고객의 문제다.

---

## 1. 타겟 페르소나 (카탈로그 모델)

세 페르소나를 **동시에** 진열하되, 도구는 단일(FlowAgent). taskflow.kr의 landing이 카탈로그 entry 역할을 한다.

### A. SMB 사무직 (1인 다역)

- **누구**: 직원 5~50명 회사의 총무·경영지원·운영 담당 1명
- **예시**: "직원 15명 카페 가맹본사의 사무 1명. 회의록 정리 + 매출 요약 + 결재 분류 + 주간 보고 다 혼자 처리"
- **결제 의향**: 회사 비용 처리 가능 (Pilot ₩500만 견딤, Cloud 월 ₩9,900 OK)
- **5종 fit**: ★★★ (5종 모두 fit)

### B. 1인 자영업 / 프리랜서 / 부업자

- **누구**: 1인 디자이너·강사·컨설턴트·소상공인. 영업·견적·고객 응대·결과물 정리 모두 본인
- **예시**: "1인 디자인 스튜디오 대표. 견적 메일·SNS 답글·고객 응대가 매일 반복"
- **결제 의향**: 개인 비용 부담 (Cloud 월 ₩9,900은 OK, Pilot은 어려움)
- **5종 fit**: 부분 (문의 답변·매출 요약·주간 보고만). **신규 3종 필요**: 견적 메일 / 영업 후처리 / SNS 답글
- **출시 전략**: 신규 3종 4~6주 구현 후 카탈로그에 추가 (B 카드 출시 전까지 wait-list 운영 가능)

### D. SMB 사장 / 대표 / 가족경영

- **누구**: 5~20명 회사 대표. 매일 매출·결재·문의·주간보고를 *받는* 입장
- **예시**: "8명 디자인 스튜디오 대표. 직원이 만든 5종 결과를 한 페이지에서 모바일로 확인"
- **결제 의향**: 매우 높음 (의사결정자 = 구매자)
- **5종 fit**: 5종 그대로 + **사장 대시보드 UX 레이어** (오늘의 매출·결재 잔량·문의 큐·주간 진행 요약)

### 제외: C. 전문직 사무소

세무·노무·법무·회계사 사무소는 슈퍼로이어·솔로몬랩스·세무사회 AI 세무사·네이버 세나클이 점령. 5번 조사 2차에서 검증.

---

## 2. 공통 차별점 (영업 메시지 헤드라인)

> **"회사 데이터가 노트북 밖으로 안 나가는 한국어 사무 자동화"**

### 왜 이 메시지인가

| 경쟁자 | 못 거는 약속 |
|---|---|
| ChatGPT·뤼튼·Notion AI | "데이터가 노트북 밖으로 안 나간다" 약속 불가 (클라우드 SaaS) |
| 자비스·더존·flex | 한국어는 강하지만 데이터는 클라우드 (멀티테넌트) |
| n8n·Make·Zapier | 한국어 SMB UX·번들 워크플로·Pilot 영업 모두 약함 |
| 슈퍼로이어·솔로몬랩스 | 전문직 vertical만 — 일반 SMB 사무직 미타깃 |
| Ollama·LM Studio·Open WebUI | local-first OK지만 "사무 워크플로 박제"는 비어있음 |

**유일하게 이 약속을 동시에 거는 한국 도구는 FlowAgent 1개.** 5번 조사가 일관되게 확인.

### 메시지의 2층 구조

```
[헤드라인]
"회사 데이터가 노트북 밖으로 안 나가는 한국어 사무 자동화"

[3 sub-claim]
① 비개발자도 더블클릭 2번으로 시작 (start.bat)
② 5종 한국 사무 워크플로 바로 사용 (회의록·매출·결재·문의·주간보고)
③ 한 번 만들면 매일 같은 결과 (YAML 박제)
```

---

## 3. 5종 워크플로 → 페르소나 매핑

| 워크플로 | A 사무직 | B 자영업 | D 사장 |
|---|---|---|---|
| 회의록 → 액션 분류 | ★★★ 매일 | ★ (혼자는 회의 적음) | ★★ (보고용 요약) |
| 매출 CSV → 임원 요약 | ★★ | ★★ (월별 결산) | ★★★ 매일 |
| 결재 대기함 → 분류·브리프 | ★★★ | ★ (개인은 결재 없음) | ★★ (대시보드용) |
| 고객 문의 → 분류·답변 | ★★ (CS팀 있을 때) | ★★★ 매일 (1인 응대) | ★ |
| 주간 보고 → Slack 포맷 | ★★★ | ★ (대상 없음) | ★★ (받는 입장) |

### 페르소나별 entry 묶음

- **A entry (/sumu)**: 5종 그대로 — 자산 재설계 0
- **B entry (/solo)**: 매출·문의·주간보고 3종 + **신규 3종**: 견적 메일 / 영업 후처리 / SNS 답글
- **D entry (/executive)**: 5종 + 사장 대시보드 UX (모바일 한 페이지 요약)

---

## 4. 사이트 구조 (taskflow.kr)

### Landing 구조

```
/ (taskflow.kr)
├─ Hero
│  └─ "회사 데이터가 노트북 밖으로 안 나가는 한국어 사무 자동화"
│  └─ 3 sub-claim 한 줄씩
│
├─ 페르소나 entry 섹션 (3 카드)
│  ├─ A. SMB 사무직 → /sumu     (회의록·매출·결재·문의·주간보고)
│  ├─ B. 1인 자영업 → /solo     (견적·영업·SNS 답글·문의·매출)
│  └─ D. SMB 사장   → /executive (사장 대시보드)
│
├─ 공통 진입
│  ├─ /download  start.bat zip
│  ├─ /pricing   가격 (Free / Pro / Team / Pilot)
│  ├─ /docs      문서 (7섹션)
│  └─ Pilot 미팅 신청 (mailto)
│
└─ /blog, /templates (placeholder, v2)
```

### 출시 전략 — 3 페르소나 동시

B 신규 3종 구현(4~6주)이 critical path. 그 동안:
- A 페르소나 페이지·D 사장 대시보드 UX 구현
- 마케팅 사이트 헤드라인·페르소나 카드·pricing 페이지 재설계
- SEO/OG 작업(현 uncommitted 7파일) 정리·커밋

출시일 = 3 페르소나 카드 모두 작동하는 시점.

---

## 5. Product Shape

### 디폴트: Desktop (Local-first 차별점 결정으로 자연 도출)

- `start.bat` 더블클릭 → 자동 설치 → 브라우저 자동 오픈 (현재 모습 그대로)
- 회사 데이터는 노트북 안 `workflows/fixtures/`에 머무름
- `runs/*.jsonl` 감사 로그도 노트북 안

### 옵션 1: Cloud 호스팅 (FlowAgent.cloud)

- 대상: start.bat이 어려운 사용자, 회사 자체 서버 호스팅 원하는 곳
- 방식: **self-host (docker)** 또는 **FlowAgent 측 호스팅 (데이터는 입력 시점에만 처리, 저장 안 함)**
- **차별점과의 양립**: spec 안에 명시 — "회사 데이터가 노트북 *또는 회사 자체 서버* 밖으로 안 나가는"으로 헤드라인 단서 추가 가능. self-host 우선, FlowAgent.cloud는 부수 옵션.

### 옵션 2: 모바일 결과 보기 (D 페르소나 특화)

- 결과 페이지 반응형
- 서명 토큰 URL (만료 1시간) 공유 가능
- D 사장이 노트북 밖에서 결과 확인 (실행은 노트북에서)

### 차후 (v2): Chrome 확장

기존 SaaS(Notion·Slack·Gmail) 화면 위에 oneclick 자동화. 데이터 유출 위험 있으므로 v2.

---

## 6. UX 디자인 — 8개 Reference + 8개 Pattern

### Reference 4개씩 매핑

| 그룹 | 도구 | 핵심 수치 | 참고점 |
|---|---|---|---|
| **매출 1** | [삼쩜삼](https://thevc.kr/jobisnvillains) | 2,400만 가입, 매출 838억 | 카드 한 장 결과 + 친근 톤 |
| **매출 2** | [채널톡](https://channel.io/ko/blog/articles/arr360-60b601c5) | ARR 360억, 80% SMB | 자가-온보딩 + MAU 가격 |
| **매출 3** | [flex](https://flex.team/pricing) | 매출 279.4억, 기업가치 5,000억 | 필수+선택 모듈 가격 |
| **매출 4** | [두레이!](https://dooray.com/main/en/pricing/) | SaaS 40%+/년 성장, 공공 1위 | 25명 이하 영구 무료 임계 |
| **UX 1** | [토스](https://toss.tech/article/toss-design-system) | (디자인 시스템) | 카드 위계 + 컴포넌트 일관성 |
| **UX 2** | [잔디](https://www.jandi.com/landing/kr/pricing) | 누적 40만 팀, 2024 첫 흑자 | 가격 "이 사람 = 이 가격" |
| **UX 3** | [카카오뱅크](https://story.pxd.co.kr/1253) | (UX reference) | 슬로건+이미지+3 bullet 상품 카드 |
| **UX 4** | [당근](https://about.daangn.com/company/pr/archive/) | 매출 2,707억, MAU 2,100만 | 친근 UX 라이팅 + Seed DS |

### 통합 8개 Design Pattern

| # | Pattern | 추출 ref | FlowAgent 적용 위치 |
|---|---|---|---|
| **P1** | 결과 카드 = 슬로건+이미지+3 bullet 고정 | 삼쩜삼+카카오뱅크 | `index.astro`, `docs.astro` |
| **P2** | 친근 한국어 UX 라이팅 + 말꼬리 | 삼쩜삼+당근 | 모든 button label, `EmailForm.astro` |
| **P3** | 3탭 페르소나 entry (A·B·D) | 토스+카카오뱅크 | `index.astro` Hero 아래 |
| **P4** | 가격 "이 사람=이 가격" + 임계 숫자 배지 | 잔디+flex+두레이 | `pricing.astro` Trigger 카드 |
| **P5** | 컴포넌트 일관성 (Tailwind 토큰 고정) | 토스+당근 Seed | `BaseLayout.astro` 전역 |
| **P6** | 필수+선택 가격 위계 (모듈 조립형) | flex | `pricing.astro` compareGroups |
| **P7** | 무료 임계점 큰 숫자 배지 | 두레이 | `pricing.astro` Free 카드 |
| **P8** | 모바일 터치 우선 (≥44px tap, 16px font) | 카카오뱅크+당근 Seed | 전 페이지 button |

### 적용 우선순위

- **즉시 (1~2시간)**: P7 (Free 임계 배지), P2 (button 말꼬리 일괄)
- **Pro 출시 전 (반나절)**: P6 (비교표 첫 그룹 강조), P4 강화
- **Landing 개편 (1~2일)**: P1·P3·P8 — 카카오뱅크 상품 카드 템플릿으로 5종 카드 재설계

---

## 7. Monetization mechanic (MVP 3개 동시)

| Mechanic | 가격 | 시작 시점 | 검증 가설 |
|---|---|---|---|
| **무료 다운로드** (OSS·start.bat) | ₩0 | 출시 즉시 | brand·lead funnel — 페르소나별 다운로드 conversion |
| **Cloud 호스팅** | 월 ₩19,900 | 출시 즉시 | start.bat 부담 사용자 결제 의향 |
| **Pilot 미팅** | 4주 ₩500만 (시장가 floor, KOSA SW 단가의 63%) | 출시 즉시 | 결제 의향 검증 + 1번 고객 |

### 추가 mechanic (출시 후)

| Mechanic | 가격 | 시작 시점 |
|---|---|---|
| 워크플로 템플릿 팩 (B용) | ₩29,900 1회 | B 출시 시 |
| 강의 (인프런·자체) | ₩99K~₩200K | M6+ |
| 유료 뉴스레터 | 월 ₩9,900~₩29,900 | M6+ |

### 가격 페이지 구조 (pricing.astro)

- **Free**: 노트북 1대·평생 무료 (P7 임계 배지)
- **Pro**: 월 ₩19,900 (Cloud 호스팅 + B 신규 워크플로 액세스) → 1인 자영업·SMB 사무직
- **Team**: 인당 월 ₩9,900 (멀티 사용자·자체 호스팅) → SMB 사장
- **Pilot**: 4주 ₩500만 (1대1 워크플로 설계 + 4주 운영 지원)

각 플랜에 "이 분께 추천" (잔디 모델) + 정부 SW/클라우드 바우처 노출.

---

## 8. 검증 가설 + 측정 (첫 3개월)

### 핵심 KPI

| 측정 | M1 | M2 | M3 |
|---|---|---|---|
| 페르소나별 다운로드 (A·B·D 카드 클릭 → start.bat zip) | A:100, B:50, D:30 | A:200, B:100, D:60 | A:300, B:200, D:100 |
| Pilot 미팅 신청 (mailto 클릭) | 2 | 4 | 5 |
| 첫 Pilot 계약 | 0 | 1 | 1~2 |
| Cloud 호스팅 첫 결제 | 0 | 0 | 1 |
| B wait-list 등록 | 30 | 50 | 80 |

### Go / No-Go 기준 (M3 시점)

| 결과 | 다음 액션 |
|---|---|
| **3개 페르소나 다 conversion** | C-4 하이브리드 spec대로 진행, B 출시 |
| **A·D만 conversion, B 0** | B 페르소나 폐기 또는 wait-list만 유지. A·D에 집중 |
| **B만 conversion, A·D 미달** | B 우선 + A·D는 부수적 (페르소나 재배치) |
| **다 미달** (Pilot 0건·다운로드 < A:50) | spec 재검토. 가격 조정 또는 다른 mechanic 시도 |

### 검증 도구

- 다운로드 측정: 페르소나별 다른 URL slug + 서버 로그 (`/sumu`, `/solo`, `/executive`)
- Pilot 신청: mailto subject 페르소나별 prefix (`[A]`, `[B]`, `[D]`)
- Cloud 결제: 토스페이먼츠 또는 Lemonsqueezy
- B wait-list: Loops 또는 자체 폼

---

## 9. 위험과 대응 (5번 조사가 가르쳐준 risks)

| 위험 | 확률 | 영향 | 대응 |
|---|---|---|---|
| **콘텐츠 burnout** (24~36개월) | 60% | High | 콘텐츠 주 1편 글 + 분기 1편 영상으로 페이스 제한 |
| **lead funnel 0** | 35% | Catastrophic | 콘텐츠 단독 의존 금지. LinkedIn 직접 영업·무료 진단 세미나 병행 |
| **FlowAgent OSS 유지 시간 잠식** | 70% | Medium | **scope freeze** — 5종 + 신규 3종 = 총 8종. n8n과 기능 경쟁 절대 X |
| **가격 anchor 충돌** (SMB ₩100K/월 익숙 vs Pilot ₩500만) | 65% | Medium | Pilot 후 월 retainer ₩50~150만/월 전환 옵션 spec에 명시 |
| **n8n 한국어 진출** | 30% | Medium | 한국어 SMB 친화 UX·5종 사례·Pilot으로 차별화 유지 |
| **K-LLM 컨소시엄 자체 워크플로** | 진행 중 | Catastrophic | 직접 경쟁 회피. 솔로 솔루션의 lock-in (P7 임계 배지·P4 Trigger 명시)으로 차별화 |
| **건강·개인 사정** (솔로 가장 큰 risk) | 5~10% | Catastrophic | 18~24개월 시점 1인 법인 + 외주 파트너 검토 |

---

## 10. 명시적 Out-of-Scope (이번 spec 범위 외)

이 spec은 정체성 + UX + monetization의 **방향** 결정. 구현 세부는 writing-plans skill로 따로.

명시적으로 **이 spec에 포함하지 않는 것**:
- B 신규 3종 워크플로의 YAML 상세 설계 (구현 task에서)
- Cloud 호스팅의 self-host vs FlowAgent.cloud 결정 (M3 데이터 보고 결정)
- 인프런·패스트캠퍼스 강의 출시 (M6+)
- 글로벌 진출 (한국어 자산 활용 우선)
- 공동창업자 영입 (18~24개월 시점에 별도 검토)
- 외부 시드 펀딩 (현재 단계 X)
- Chrome 확장·Slack bot·모바일 앱 (v2)

---

## 11. Next Steps

1. **이 spec 사용자 검토** ← 현재 단계
2. **writing-plans skill 진입**: 위 결정 사항을 2~5분 단위 구현 task로 분해
3. **출시까지 critical path** (4~6주 추정):
   - 마케팅 사이트 페르소나 카드 3개 (A·D 실작동 + B wait-list)
   - Pricing 페이지 재설계 (P4·P6·P7 적용)
   - 사장 대시보드 UX (D 페르소나)
   - B 신규 워크플로 3종 YAML + fixture
   - Cloud 호스팅 self-host docker 또는 FlowAgent.cloud 결정
   - SEO/OG uncommitted 7파일 정리·커밋
4. **출시 후 첫 3개월** KPI 측정 → Go/No-Go (§8)

---

## 12. 결정 근거 (conversation context 요약)

5번의 deep-dive를 거쳐 도달한 결정:
- (1차) 한국 SaaS 시장 wide-scan → A사분면 빈자리 가설
- (2차) A사분면 verify → 점령 확인 (슈퍼로이어·솔로몬랩스·세나클·flex·세무사회 AI 세무사)
- (3차) Cross-vertical 부서·환경 → 공공·K-LLM 5팀 컨소시엄도 점령
- (4차) A안 OSS+컨설팅 deep-dive → K-LLM 파트너십 닫힘, 솔로 ARR ₩1B 사례 0건, 천장 ₩100~250M
- (5차) C-4 하이브리드 사업성 → 확률 30%, 가중평균 ARR ₩1.85억/36개월
- 페르소나 결정: A+B+D 카탈로그 모델 (사용자 직접 선택)
- 차별점 결정: Local-first + 한국어 (5번 조사 일관 검증)
- UX reference 8개 + design pattern 8개

**핵심 깨달음**: 큰 SaaS 시장 빈자리는 없고, 1번 고객까지의 최단 경로가 정체성 정의의 진짜 목적이다. 시장 점령은 100번째 고객의 문제.

---

**작성자 노트**: 이 spec은 brainstorming session의 결과물입니다. 다음 단계(writing-plans)에서 task 단위로 분해되며, 그 task 실행 결과가 M3 시점 Go/No-Go 데이터를 만듭니다. spec 자체는 살아있는 문서로, M3 데이터 후 §8 결과에 따라 재정의 가능.
