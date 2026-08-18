# scripts

## render-scenes.js

`squirrel.html`이 넘기는 슬라이드 이미지를 미리 굽는다.

```
node scripts/render-scenes.js
```

- 그림 코드는 `assets/scene-render.js` 한 곳에 있다. 이 스크립트와 페이지가 같이 쓴다.
- 계절 6종 × 컷 7종 = 42장을 1600×900 JPEG로 `assets/scenes/`에 쓴다.
- `density` 값이 털·잎의 촘촘함을 정한다. 미리 굽는 쪽은 2.5,
  화면에서 실시간으로 그릴 때는 1을 쓴다 (60fps 예산).
- 헤드리스 Chromium 경로는 `PW_CHROMIUM` 환경변수로 바꿀 수 있다.

장면 구도(카메라·인물 위치)를 바꿨다면 이 스크립트를 다시 돌려서
`assets/scenes/`를 갱신하고 함께 커밋한다.
