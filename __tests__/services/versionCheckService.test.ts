import {
  evaluateVersion,
  RemoteVersionInfo,
  CURRENT_VERSION_CODE,
} from "@/services/versionCheckService";

describe("versionCheckService", () => {
  it("detects force update when current version is below minimum", () => {
    const remoteInfo: RemoteVersionInfo = {
      minimumVersionCode: 11,
      latestVersionCode: 12,
      latestVersionName: "1.2.0",
      forceUpdate: true,
      title: "Atualização Obrigatória",
      message: "Nova versão necessária.",
      storeUrl: "https://play.google.com/store/apps/details?id=com.kynio.app",
    };

    const result = evaluateVersion(remoteInfo, 10, "1.1.4");
    expect(result.status).toBe("FORCE_UPDATE");
    expect(result.isForceUpdate).toBe(true);
    expect(result.latestVersionName).toBe("1.2.0");
  });

  it("detects optional update when current version is below latest but at or above minimum", () => {
    const remoteInfo: RemoteVersionInfo = {
      minimumVersionCode: 10,
      latestVersionCode: 11,
      latestVersionName: "1.1.5",
      forceUpdate: true,
      storeUrl: "https://play.google.com/store/apps/details?id=com.kynio.app",
    };

    const result = evaluateVersion(remoteInfo, 10, "1.1.4");
    expect(result.status).toBe("OPTIONAL_UPDATE");
    expect(result.isForceUpdate).toBe(false);
    expect(result.latestVersionName).toBe("1.1.5");
  });

  it("identifies app as up to date when on latest version", () => {
    const remoteInfo: RemoteVersionInfo = {
      minimumVersionCode: 10,
      latestVersionCode: 10,
      latestVersionName: "1.1.4",
      forceUpdate: true,
    };

    const result = evaluateVersion(remoteInfo, 10, "1.1.4");
    expect(result.status).toBe("UP_TO_DATE");
    expect(result.isForceUpdate).toBe(false);
  });


});
