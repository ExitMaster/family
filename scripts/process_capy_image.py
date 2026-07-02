import sys, numpy as np
from PIL import Image
from scipy.ndimage import label

def _resize_premultiplied(arr, new_w, new_h):
    # 투명 영역 아래 남은 원색이 리사이즈 보간 시 번지는 것 방지: premultiplied alpha로 리사이즈 후 복원.
    rgb = arr[...,:3].astype(np.float32)
    al = arr[...,3:4].astype(np.float32)
    premult = rgb * (al/255.0)
    premult_img = Image.fromarray(np.clip(premult,0,255).astype(np.uint8),'RGB').resize((new_w,new_h), Image.LANCZOS)
    alpha_img = Image.fromarray(arr[...,3].astype(np.uint8),'L').resize((new_w,new_h), Image.LANCZOS)
    premult_r = np.array(premult_img).astype(np.float32)
    alpha_r = np.array(alpha_img).astype(np.float32)
    rgb_r = np.zeros_like(premult_r)
    mask = alpha_r > 2
    rgb_r[mask] = premult_r[mask] / (alpha_r[mask][:,None]/255.0)
    rgb_r = np.clip(rgb_r,0,255).astype(np.uint8)
    out = np.dstack([rgb_r, np.clip(alpha_r,0,255).astype(np.uint8)])
    return Image.fromarray(out,'RGBA')

def process(path_in, path_out, pad=14, max_dim=700):
    im = Image.open(path_in).convert('RGBA')
    arr = np.array(im).astype(np.int16)
    r,g,b,a = arr[...,0], arr[...,1], arr[...,2], arr[...,3]
    mx = np.maximum(np.maximum(r,g),b)
    mn = np.minimum(np.minimum(r,g),b)
    sat = mx - mn
    gray = (r+g+b)/3.0
    bg_like = (sat < 28) & (mn > 150)
    lbl, n = label(bg_like)
    h, w = bg_like.shape

    border_labels = set(lbl[0,:]) | set(lbl[-1,:]) | set(lbl[:,0]) | set(lbl[:,-1])
    border_labels.discard(0)
    remove = set(border_labels)

    gy, gx = np.gradient(gray)
    jump = (np.abs(gy) > 10) | (np.abs(gx) > 10)
    for lab_id in range(1, n+1):
        if lab_id in remove: continue
        m = (lbl == lab_id)
        area = m.sum()
        if area < 400: continue
        if jump[m].mean() > 0.12:
            remove.add(lab_id)

    remove_mask = np.isin(lbl, list(remove))
    arr[...,3] = np.where(remove_mask, 0, arr[...,3])
    arr_u8 = arr.astype(np.uint8)
    out = Image.fromarray(arr_u8, 'RGBA')
    bbox = out.getbbox()
    if bbox:
        x0,y0,x1,y1 = bbox
        x0=max(0,x0-pad); y0=max(0,y0-pad); x1=min(w,x1+pad); y1=min(h,y1+pad)
        arr_u8 = arr_u8[y0:y1, x0:x1]
    oh, ow = arr_u8.shape[0], arr_u8.shape[1]
    scale = min(1.0, max_dim/max(ow,oh))
    if scale < 1.0:
        nw, nh = max(1,int(ow*scale)), max(1,int(oh*scale))
        out = _resize_premultiplied(arr_u8, nw, nh)
    else:
        out = Image.fromarray(arr_u8, 'RGBA')
    out.save(path_out, optimize=True)
    return out.size

if __name__=='__main__':
    sz = process(sys.argv[1], sys.argv[2])
    print('saved', sys.argv[2], sz)
