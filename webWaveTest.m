
vel = 1; % speed of wave;
dx = 1; % space step;
dt = 0.1; % time step;
m = 10;
n = 10; % sizes
tm = 1000; % time
gamma = 0.002; % decay factor

dp=0.01; % droplet probability per one time sterp
dsz=2; % droplet size
da= 0.5; % droplet amplitude

x=dx:dx:m;
y=dx:dx:n; % space

Lx=length(x);
Ly=length(y);

u=zeros(Ly,Lx); % initial value
uo=u; % previous = curent => velocties =0

D=[0 1 0; 1 -4 1; 0 1 0]; % 2d laplace operator

c1 = 2 - gamma * dt;
c2 = gamma*dt - 1;
c3 = dt^2*vel^2/dx^2;

% droplet as gaussian
u(round(m/2) + 1, round(n/2) +1 ) = 1;

tic;
for ii = 1:2000

    un = c1*u + c2*uo + c3*testconv2(u,D,m,n); % new
    uo=u; % curent become old
    u=un; % new become current
    %full(u)

end
endtime = toc;

fprintf('%4.0f\n',endtime*1000)
u