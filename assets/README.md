# assets/

영업 자료용 미디어 파일을 두는 자리. **무거운 바이너리(mp4, mov, png > 1MB)는 직접 commit 하지 않습니다.**

## 호스팅 규칙

| 자산 | 호스팅 | 참조 방식 |
|---|---|---|
| 1분 데모 영상 (`pilot-demo-1min.mp4`) | GitHub Release asset | README가 Release raw URL을 embed |
| 데모 스크린샷 (PNG) | repo 직접 commit 가능 (< 200KB 권장) | 상대경로 |
| Pilot one-pager PDF | repo 직접 commit (`docs/sales/pilot-onepager.pdf`, 121KB) | 그대로 |

## GitHub Release asset 업로드 (영상)

녹화 mp4 파일을 만든 후:

```bash
gh release create v0.1.0-demo \
  --title "Pilot demo assets v0.1" \
  --notes "1분 데모 영상 + 스크린샷" \
  ./pilot-demo-1min.mp4
```

업로드 직후 `gh release view v0.1.0-demo` 출력에서 asset URL을 복사해 README의 `<video>` 태그 src에 붙여넣음.

## 새 자산 추가 절차

1. 파일 크기 확인 — `du -h <파일>`
2. < 1MB && commit 가능 자산 → `assets/<file>` 에 두고 `git add`
3. ≥ 1MB → GitHub Release에 업로드, 이 README의 표·README의 임베드 갱신
4. 모든 영상 파일명 규약: `pilot-demo-<용도>-<duration>.<ext>` (예: `pilot-demo-1min.mp4`, `pilot-demo-listing-15sec.mp4`)
