# Pilot demo — 1분 영상 storyboard

> 5종 워크플로우 순회 데모. 실시간 총 실행 75초 → **컷 편집으로 60초 압축**. 녹화는 1080p 30fps, OBS 또는 QuickTime, 한국어 음성 내레이션.
> 짝 문서: [README — 1분 데모 영상 제작 가이드](../../README.md), [assets/README.md](../../assets/README.md).

## 사전 점검 (녹화 직전 60초)

```bash
# 1. 깨끗한 runs 디렉토리로 (자체 검증용 로그 제거)
rm -f runs/*.jsonl

# 2. 서버 재기동 + 한 번 워크플로우 실행해 cold-start 비용 제거 (워밍업)
pnpm dev > /dev/null 2>&1 &
sleep 3
curl -sf http://localhost:3000/ > /dev/null && echo OK

# 3. 브라우저: localhost:3000 새 탭, 캐시 disable (Cmd+Shift+R)
# 4. 화면 비율: 1920x1080, 브라우저 zoom 100%, 다크모드 OFF (한국어 가독성)
# 5. 알림 OFF: macOS Focus / Windows 방해금지
```

## 1분 분할 (초 단위)

| 시간 | 화면 | 행동 | 내레이션 (한국어) | 편집 메모 |
|---|---|---|---|---|
| **0:00–0:05** | Title card (`assets/pilot-demo-title.png` 또는 텍스트 오버레이) | — | "FlowAgent — 한 번 설정하면, 업무가 알아서 흐른다." | 0:00 정적 1초 + 0:01–0:05 페이드인 |
| **0:05–0:12** | localhost:3000 listing page 풀화면 | 페이지 전체 천천히 스크롤 한 번 | "한국 중소기업 사무팀이 매일 반복하는 일 5가지. 워크플로우 카드 하나가 한 가지 반복을 없애줍니다." | 7초 안에 5장 카드 모두 한 번씩 화면에 잡힐 것 |
| **0:12–0:22** | `/workflows/weekly-report-demo` detail + Run | "Run" 클릭 → SSE 스트리밍 → 결과 화면 | "주간 보고. 3단계로 초안 생성·정제·Slack 포맷까지 9초." | **편집: 9초 실행을 10초 안에 — 스트리밍 중간 1–2초 컷, 결과 화면 1초 hold** |
| **0:22–0:30** | `/workflows/meeting-actions` detail + Run | listing으로 백 → 두 번째 카드 클릭 → Run | "회의록에서 액션 아이템과 담당자, 마감일 자동 추출." | 10초 실행 → 8초로 압축 (스트리밍 중간 컷) |
| **0:30–0:38** | `/workflows/sales-summary` detail + Run | listing → 세 번째 카드 → Run | "월간 매출 CSV가 경영진 보고용 3문장 1-pager로." | 15초 실행 → 8초 (시작 1초 + 결과 표 5초 + transition 2초) |
| **0:38–0:46** | `/workflows/inquiry-triage` detail + Run | listing → 네 번째 카드 → Run | "고객 문의 6건이 카테고리·긴급도로 분류되고 카테고리별 답변 초안까지." | 24초 실행 → 8초로 가장 큰 컷. 시작 0.5초 + 분류 결과 표 5초 + 답변 초안 1줄 2.5초 |
| **0:46–0:54** | `/workflows/approval-triage` detail + Run | listing → 다섯 번째 카드 → Run | "결재 대기함을 자동승인·검토·정보부족으로 나눠, 오늘 처리할 결재만 brief로." | 17초 실행 → 8초 |
| **0:54–0:60** | listing page로 복귀 + Pilot CTA banner 강조 | banner 클릭(이메일 mailto 열림 직전 컷) | "노트북 한 대에서 5분 안에 시작. Pilot 4주 무료 진행 — 본 영상 설명란 이메일로 회신 주세요." | CTA banner zoom-in 1.5x, 마지막 1초 정적 hold |

## 컷 편집 핵심 (75초 → 60초)

각 워크플로우 풀 실행을 그대로 보여주면 75초가 나옵니다. 60초로 맞추려면 **워크플로우당 평균 1.5–3초 절약** 필요. 절약 포인트:

1. **LLM 스트리밍 중간 1–2초 컷** — 첫 토큰 등장 + 마지막 결과 화면만 보이고 중간은 빠른 페이드. 시청자는 "스트리밍 중" 인지하면 충분.
2. **listing → detail 화면 전환 0.5초 컷** — 클릭 → URL 변경 → 페이지 로드 중간 컷.
3. **결과 표 hold 시간 절제** — 결과 보여주는 시간 1–1.5초면 충분 (반복 시청 가능한 영상).

## 내레이션 풀 스크립트 (한국어, 약 110 단어)

> 시연자가 직접 녹음. 톤: 차분, 자신감, 영업 분위기 X.

```
FlowAgent. 한 번 설정하면, 업무가 알아서 흐른다.

한국 중소기업 사무팀이 매일 반복하는 일 5가지.
워크플로우 카드 하나가 한 가지 반복을 없애줍니다.

주간 보고. 3단계로 초안 생성·정제·Slack 포맷까지 9초.
회의록에서 액션 아이템과 담당자, 마감일 자동 추출.
월간 매출 CSV가 경영진 보고용 3문장 1-pager로.
고객 문의 6건이 카테고리·긴급도로 분류되고 카테고리별 답변 초안까지.
결재 대기함을 자동승인·검토·정보부족으로 나눠, 오늘 처리할 결재만 brief로.

노트북 한 대에서 5분 안에 시작.
Pilot 4주 무료 진행 — 본 영상 설명란 이메일로 회신 주세요.
```

## 녹화 도구별 설정

### OBS Studio (권장, 무료)

- Source: Display Capture (Primary monitor)
- Resolution: 1920×1080, FPS: 30
- Encoder: x264, Rate Control: CBR, Bitrate: 4000 Kbps
- Audio: Mic input (한국어 내레이션) + Desktop audio OFF
- Output: mp4, /Users/<you>/pilot-demo-1min.mp4

### macOS QuickTime (간단)

- File → New Screen Recording → Selection of full screen
- Mic: 내장 또는 외장 USB 마이크 (노이즈 적은 것)
- 녹화 후 QuickTime → Export → 1080p, 30fps

## 녹화 후 편집 (간단)

1. **iMovie / DaVinci Resolve** (무료) — 75초 원본을 가져와 위 "컷 편집 핵심" 따라 잘라내기
2. 자막 — 내레이션 한국어 자막 burn-in 권장 (SMB 고객 사내 mute 재생 대비)
3. Export: H.264 mp4, 1080p, 30fps, audio AAC 192kbps → 약 10–20MB

## 업로드

```bash
# repo 루트에서
gh release create v0.1.0-demo \
  --title "Pilot demo assets v0.1" \
  --notes "1분 데모 영상" \
  ./pilot-demo-1min.mp4

# asset URL 출력 → README 의 <video src="..."> 또는 [![](thumb)](url) 에 붙여넣기
gh release view v0.1.0-demo --json assets --jq '.assets[].url'
```

## Fallback (녹화 실패 시 미팅 자리에서 즉시 대체)

- **인터넷 끊김** — Pre-recorded 영상은 노트북 로컬 사본 1개 항상 보유.
- **녹화 mp4 잃어버림** — `docs/sales/pilot-demo-storyboard.md`(이 파일)을 미팅 자리에서 한 화면씩 라이브 실행으로 대체 (총 75초). 내레이션은 이 문서의 "내레이션 풀 스크립트" 그대로.
- **LLM API 한도** — 데모 직전 `runs/*.jsonl` 한 세트 미리 캡처해서 결과 페이지를 정적으로 보여줄 수 있음 (README "장애 발생 시 30초 복구" 참조).

## 갱신 트리거

- 6번째 워크플로우 추가 시 → storyboard 시간 배분 재계산 (60초 → 70–75초로 늘리거나 워크플로우당 6.5초로 압축)
- listing page UI 변경 시 → 0:05–0:12 컷 재녹화
- Pilot CTA banner 텍스트/링크 변경 시 → 0:54–0:60 재녹화
