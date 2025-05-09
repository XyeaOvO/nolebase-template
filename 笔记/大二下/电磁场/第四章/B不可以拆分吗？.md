---
create: 2025-04-08 09:37
---
其实可以！$\nabla \times \mathbf{B} = \mu_0 \mathbf{J}$ 这个矢量偏微分方程本身，确实也可以在特定的坐标系（比如笛卡尔坐标系）下**分解**成三个标量偏微分方程。

让我们在笛卡尔坐标系下看一下这个分解：
$\mathbf{B} = B_x \mathbf{\hat{a}}_x + B_y \mathbf{\hat{a}}_y + B_z \mathbf{\hat{a}}_z$
$\mathbf{J} = J_x \mathbf{\hat{a}}_x + J_y \mathbf{\hat{a}}_y + J_z \mathbf{\hat{a}}_z$

$\nabla \times \mathbf{B} = \left(\frac{\partial B_z}{\partial y} - \frac{\partial B_y}{\partial z}\right) \mathbf{\hat{a}}_x + \left(\frac{\partial B_x}{\partial z} - \frac{\partial B_z}{\partial x}\right) \mathbf{\hat{a}}_y + \left(\frac{\partial B_y}{\partial x} - \frac{\partial B_x}{\partial y}\right) \mathbf{\hat{a}}_z$

令 $\nabla \times \mathbf{B} = \mu_0 \mathbf{J}$，我们得到三个标量方程：

1.  $\frac{\partial B_z}{\partial y} - \frac{\partial B_y}{\partial z} = \mu_0 J_x$
2.  $\frac{\partial B_x}{\partial z} - \frac{\partial B_z}{\partial x} = \mu_0 J_y$
3.  $\frac{\partial B_y}{\partial x} - \frac{\partial B_x}{\partial y} = \mu_0 J_z$

**关键的区别在于：**

*   **这种分解得到的三个标量方程是相互耦合（Coupled）的。** 你看第一个方程涉及 $B_y$ 和 $B_z$；第二个涉及 $B_x$ 和 $B_z$；第三个涉及 $B_x$ 和 $B_y$。你**不能**独立地只解其中一个方程来得到一个分量，比如只解第一个方程得到 $B_z$。你需要将这三个方程作为一个**方程组**来**同时求解** $B_x, B_y, B_z$。此外，你还需要同时满足 $\nabla \cdot \mathbf{B} = 0$ 这个条件。

*   **而通过引入矢量磁位 $\mathbf{A}$ (并使用库仑规范 $\nabla \cdot \mathbf{A} = 0$) 得到的三个标量方程是解耦（Decoupled）的。**
    *   $\nabla^2 A_x = -\mu_0 J_x$
    *   $\nabla^2 A_y = -\mu_0 J_y$
    *   $\nabla^2 A_z = -\mu_0 J_z$
    这里的**每个方程只包含一个未知数**（$A_x$ 或 $A_y$ 或 $A_z$）。你可以独立地求解第一个方程得到 $A_x$（只需要知道 $J_x$），独立求解第二个方程得到 $A_y$（只需要知道 $J_y$），独立求解第三个方程得到 $A_z$（只需要知道 $J_z$）。求解这种解耦的标量泊松方程通常比求解耦合的偏微分方程组要**简单得多**，因为我们可以直接套用泊松方程的积分解。

**总结:**

是的，$\nabla \times \mathbf{B} = \mu_0 \mathbf{J}$ 也可以分解成三个标量 PDE。但是，得到的这组方程是**耦合**的，求解起来通常更复杂。而引入矢量磁位 $\mathbf{A}$ 的**主要优势之一**就是它（在合适的规范下）可以将问题转化为求解三个**解耦**的标量泊松方程，这在数学处理上通常更为方便。同时，$\mathbf{B} = \nabla \times \mathbf{A}$ 的定义自动保证了 $\nabla \cdot \mathbf{B} = 0$ 条件的满足。