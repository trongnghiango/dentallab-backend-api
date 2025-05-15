# Notes

```nix
├── flake.lock
├── flake.nix
├── home
│   └── ka
│       ├── default.nix
│       └── qtile
│           └── config.py
├── hosts
│   ├── laptop
│   │   └── configuration.nix
│   └── vm
│       ├── configuration.nix
│       └── hardware-configuration.nix
├── install.sh
├── modules
│   ├── common.nix
│   ├── neovim.nix
│   └── ui.nix
├── README.md
└── setup_nixos_repo.sh
```

- Noi dung cua file hosts/vm/configuration.nix

```nix
{ config, pkgs, ... }:

{
  imports = [
    ../../modules/common.nix
    ./hardware-configuration.nix
  ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  networking.hostName = "vm";
  services.xserver.enable = true;
  services.xserver.xkb = {
    layout = "us";
    variant = "";
  };

  # bật dconf-service, và nó cần dbus để hoạt động.
  services.dbus.enable = true;
  programs.dconf.enable = true;


  # Bật display manager LightDM
  services.xserver.displayManager = {
    lightdm.enable = true;

    # Lệnh chạy sau khi đăng nhập vào session
    sessionCommands = ''
      xrandr --output Virtual-1 --mode 1360x768
      xwallpaper --zoom ~/walls/castle.jpg
      xset r rate 200 35 &
      picom --experimental-backends &
    '';
  };
  # Bật Window Manager Qtile
  services.xserver.windowManager.qtile.enable = true;

  # Tuỳ chọn: cấu hình màn hình cụ thể
  services.xserver.extraConfig = ''
    Section "Monitor"
      Identifier "Virtual-1"
      Option "PreferredMode" "1360x768"
    EndSection
  '';

  # Theme lightdm
  services.xserver.displayManager.lightdm.greeters.mini = {
    enable = true;
    user = "ka";
    extraConfig = ''
      [greeter]
      show-password-label = false
      [greeter-theme]
      background-image = ""
    '';
  };

  home-manager.useUserPackages = true;
  home-manager.useGlobalPkgs = true;
  home-manager.backupFileExtension = "backup"; # ✅ Đặt ở đây nè
  users.users.ka = {
    isNormalUser = true;
    home = "/home/ka";
    extraGroups = [ "wheel" ];
  };

  environment.systemPackages = with pkgs; [
    gcc
    pkg-config
    cmake
    neovim
    wget
    alacritty
    btop
    xwallpaper
    pcmanfm
    rofi
    git
    pfetch
  ];

  fonts.packages = with pkgs; [ jetbrains-mono ];

  services.openssh.enable = true;
  system.stateVersion = "24.11";
}

```

- noi dung file home/ka/default.nix

```nix
{ config, pkgs, ... }:
{
  imports = [
    # import thêm nếu cần
        ../../modules/ui.nix
  ];
  home.username = "ka";
  home.homeDirectory = "/home/ka";
  home.stateVersion = "24.11";

  programs.bash = {
    enable = true;
    shellAliases = {
      btw = "echo i use nixos btw";
      nrs = "sudo nixos-rebuild switch";
    };
    initExtra = ''
      export PS1='\[\e[38;5;76m\]\u\[\e[0m\] in \[\e[38;5;32m\]\w\[\e[0m\] \$ '
    '';
  };

  # link files
  home.file.".config/qtile".source = ./qtile;
  home.file.".config/nvim".source = ./nvim;

  home.packages =  with pkgs; [
    bat
    neofetch
    tree
  ];
}
```
