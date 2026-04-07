{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };
  outputs = {nixpkgs, ...}: let
    systems = ["x86_64-linux" "aarch64-darwin"];
    forAllSystems = nixpkgs.lib.genAttrs systems;

    deps = pkgs:
      with pkgs; [
        nodejs-slim_24
      ];

    devDeps = pkgs:
      with pkgs; [
        bun
      ];
  in {
    devShells = forAllSystems (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      default = pkgs.mkShell {
        buildInputs = (deps pkgs) ++ (devDeps pkgs);

        shellHook = ''
          export NODE_ENV=development
        '';
      };
    });
  };
}
