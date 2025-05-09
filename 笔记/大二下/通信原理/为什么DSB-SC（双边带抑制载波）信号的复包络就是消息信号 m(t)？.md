我们来解释一下为什么DSB-SC（双边带抑制载波）信号的复包络就是消息信号 $m(t)$。

1.  **DSB-SC 信号的定义**
    DSB-SC 信号是通过将消息信号 $m(t)$ 与载波信号 $c(t) = \cos(2\pi f_c t)$ （为简化，假设载波幅度 $A_c=1$）直接相乘得到的。
    所以，DSB-SC 信号 $s_{DSB}(t)$ 可以表示为：
    $s_{DSB}(t) = m(t) \cos(2\pi f_c t)$
    这里我们假设 $m(t)$ 是一个实值的基带信号（或低通信号），其带宽远小于载波频率 $f_c$。

2.  **复包络的定义**
    任何带通信号 $s(t)$ （中心频率为 $f_c$）都可以表示为其复包络 $\tilde{s}(t)$ 的形式：
    $s(t) = \text{Re}\{\tilde{s}(t) e^{j2\pi f_c t}\}$
    其中，$\tilde{s}(t)$ 是一个复值的基带（低通）信号。

    复包络 $\tilde{s}(t)$ 可以通过信号 $s(t)$ 的解析信号 $s_a(t)$ 来计算。解析信号定义为：
    $s_a(t) = s(t) + j \hat{s}(t)$
    其中 $\hat{s}(t)$ 是 $s(t)$ 的希尔伯特变换（Hilbert Transform）。
    复包络 $\tilde{s}(t)$ 与解析信号 $s_a(t)$ 的关系是：
    $\tilde{s}(t) = s_a(t) e^{-j2\pi f_c t}$

3.  **计算 DSB-SC 信号的复包络**
    我们来计算 $s_{DSB}(t) = m(t) \cos(2\pi f_c t)$ 的复包络。

    *   **第一步：计算 $s_{DSB}(t)$ 的希尔伯特变换 $\hat{s}_{DSB}(t)$**
        根据希尔伯特变换的性质，对于一个低通信号 $m(t)$，有：
        $\mathcal{H}\{m(t) \cos(2\pi f_c t)\} = m(t) \sin(2\pi f_c t)$
        （这个性质成立的前提是 $m(t)$ 的频谱完全包含在 $[-W, W]$ 内，且 $W \ll f_c$）
        所以，$\hat{s}_{DSB}(t) = m(t) \sin(2\pi f_c t)$。

    *   **第二步：构建解析信号 $s_{a,DSB}(t)$**
        $s_{a,DSB}(t) = s_{DSB}(t) + j \hat{s}_{DSB}(t)$
        $s_{a,DSB}(t) = m(t) \cos(2\pi f_c t) + j m(t) \sin(2\pi f_c t)$
        将 $m(t)$ 提出来：
        $s_{a,DSB}(t) = m(t) (\cos(2\pi f_c t) + j \sin(2\pi f_c t))$
        使用欧拉公式 $e^{j\theta} = \cos\theta + j \sin\theta$：
        $s_{a,DSB}(t) = m(t) e^{j2\pi f_c t}$

    *   **第三步：计算复包络 $\tilde{s}_{DSB}(t)$**
        $\tilde{s}_{DSB}(t) = s_{a,DSB}(t) e^{-j2\pi f_c t}$
        $\tilde{s}_{DSB}(t) = (m(t) e^{j2\pi f_c t}) e^{-j2\pi f_c t}$
        $\tilde{s}_{DSB}(t) = m(t) e^{j2\pi f_c t - j2\pi f_c t}$
        $\tilde{s}_{DSB}(t) = m(t) e^{0}$
        $\tilde{s}_{DSB}(t) = m(t)$

4.  **另一种理解方式（同相/正交分量）**
    任何带通信号 $s(t)$ 也可以表示为：
    $s(t) = x(t) \cos(2\pi f_c t) - y(t) \sin(2\pi f_c t)$
    其中 $x(t)$ 是同相分量 (In-phase component)，$y(t)$ 是正交分量 (Quadrature component)。
    复包络 $\tilde{s}(t)$ 就等于 $x(t) + j y(t)$。

    对于 DSB-SC 信号：
    $s_{DSB}(t) = m(t) \cos(2\pi f_c t)$
    我们可以将其写成：
    $s_{DSB}(t) = m(t) \cos(2\pi f_c t) - 0 \cdot \sin(2\pi f_c t)$
    比较两种形式，我们可以得到：
    $x(t) = m(t)$
    $y(t) = 0$

    因此，DSB-SC 信号的复包络是：
    $\tilde{s}_{DSB}(t) = x(t) + j y(t) = m(t) + j \cdot 0 = m(t)$

**结论：**
通过以上两种方法的推导，我们都可以得出结论：对于一个标准的 DSB-SC 信号 $s_{DSB}(t) = m(t) \cos(2\pi f_c t)$ （假设 $m(t)$ 是实信号），其复包络 $\tilde{s}_{DSB}(t)$ 就是原始的消息信号 $m(t)$。这表明 DSB-SC 调制将基带消息信号 $m(t)$ 直接作为其同相分量，而其正交分量为零。