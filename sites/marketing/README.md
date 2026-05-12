# @flowagent/marketing

taskflow.kr 마케팅 사이트 (브랜드명: FlowAgent). Astro 5 + Tailwind 4 정적 사이트.

## 개발

```bash
# 루트(C:\flowagent)에서
pnpm install
pnpm --filter @flowagent/marketing dev

# 또는 이 디렉터리에서
pnpm dev
```

기본 포트: `http://localhost:4321` (Astro 디폴트). FlowAgent 앱(`:3000`)과 충돌 안 함.

## Vercel 배포

1. Vercel 새 프로젝트 → `wndnjs3865/flowagent` 리포 연결
2. Project Settings:
   - **Framework Preset**: Astro (자동 감지)
   - **Root Directory**: `sites/marketing`
   - **Include source files outside of the Root Directory**: **ON** (워크스페이스 락파일 접근용)
3. Domain: `taskflow.kr` 추가 후 도메인 등록처 (가비아/후이즈 등)에서 DNS A/CNAME 설정 (Vercel은 `cname.vercel-dns.com` 권장)
4. 환경변수: 현재 없음 (Phase 0). Loops 연동 시 `PUBLIC_LOOPS_FORM_ID` 추가 예정

## 페이지 구조

```
/             Landing
/download     OS 자동 감지 다운로드 (다음 단계)
/pricing      4-tier 가격표 (다음 단계)
/docs         placeholder (Phase 1)
/templates    placeholder (Phase 1)
/blog         placeholder (Phase 1)
```

## 핵심 메시지

> Your workflows are plain YAML files. Your data stays on your machine.

전 페이지에서 일관되게 강조. 한국어 카피와 영문 헤드라인 병행.

## 이메일 수집

`src/components/EmailForm.astro`에 Loops 엔드포인트 URL placeholder가 있어. 실제 Loops 폼 만들고 ID 채우면 동작 시작. 그 전까지는 클라이언트에서 가짜 success를 반환 (UX 확인용).
