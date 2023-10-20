const request = require("request");

const mediaServer = {};

mediaServer.upload = (fileBuffer, file, type, configData) => {
    return new Promise((resolve, reject) => {
      const options = {
        method: "POST",
        url: process.env.MEDIA_SERVER,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          configData : JSON.stringify(configData),
          file: {
            value: fileBuffer,
            options: {
              filename: file.name,
              contentType: file.type,
            },
          },
          type: {
            value: type,
            options: {},
          },
        },
      };
      request(options, (error, response, body) => {
        if (response) {
          resolve({
            statusCode: response.statusCode,
            data: JSON.parse(response.body),
          });
        } else {
          reject(error);
        }
      });
    });
  }

mediaServer.update = (fileBuffer, file, type, configData, attachmentData) => {
    return new Promise((resolve, reject) => {
      const options = {
        method: "PUT",
        url: process.env.MEDIA_SERVER,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          configData : JSON.stringify(configData),
          attachmentData: JSON.stringify(attachmentData),
          file: {
            value: fileBuffer,
            options: {
              filename: file.name,
              contentType: file.type,
            },
          },
          type: {
            value: type,
            options: {},
          },
        },
      };
      request(options, (error, response, body) => {
        if (response) {
          resolve({
            statusCode: response.statusCode,
            data: JSON.parse(response.body),
          });
        } else {
          reject(error);
        }
      });
    });
  }

mediaServer.delete = (attachmentData) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "DELETE",
      url: process.env.MEDIA_SERVER,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      formData: {
        attachmentData: JSON.stringify(attachmentData),
      },
    };
    request(options, (error, response, body) => {
      if (response) {
        resolve({
          statusCode: response.statusCode,
          data: JSON.parse(response.body),
        });
      } else {
        reject(error);
      }
    });
  });
}

mediaServer.getSize = (orgData) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: process.env.MEDIA_SERVER_FILE_SIZE,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orgData),
    };
    request(options, (error, response, body) => {
     
      if (response) {
        resolve({
          statusCode: response.statusCode,
          data: JSON.parse(response.body),
        });
      } else {
        reject(error);
      }
    });
  });
}

module.exports = mediaServer