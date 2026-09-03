export const accessPassEmailNotification = (data) => {
  const {
    salt,
    refId,
    contactNumber,
    customerName,
    emailAddress,
    orderTotal,
    cartItems,
    paymentDetails,
  } = data;

  const showParticulars = () => {
    return cartItems.map((item) => {
      return `<tr
      style="
        padding-bottom: 0;
        padding-left: 0;
        padding-right: 0;
        padding-top: 0;
        text-align: left;
        vertical-align: top;
      "
    >
      <td
        style="
          -moz-hyphens: auto;
          -webkit-hyphens: auto;
          margin: 0;
          border-collapse: collapse !important;
          color: #0a0a0a;
          font-family: Helvetica, Arial,
            sans-serif;
          font-size: 16px;
          font-weight: 400;
          hyphens: auto;
          line-height: 1.3;
          margin: 0;
          padding: 5px 5px !important;
          padding-bottom: 0;
          padding-left: 0;
          padding-right: 0;
          padding-top: 0;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
        "
      >
        ${item.ticketId.name}
      </td>
      <td
        style="
          -moz-hyphens: auto;
          -webkit-hyphens: auto;
          margin: 0;
          border-collapse: collapse !important;
          color: #0a0a0a;
          font-family: Helvetica, Arial,
            sans-serif;
          font-size: 16px;
          font-weight: 400;
          hyphens: auto;
          line-height: 1.3;
          margin: 0;
          padding: 5px 5px !important;
          padding-bottom: 0;
          padding-left: 0;
          padding-right: 0;
          padding-top: 0;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
        "
      >
        ${item.qty}
      </td>
      <td
        style="
          -moz-hyphens: auto;
          -webkit-hyphens: auto;
          margin: 0;
          border-collapse: collapse !important;
          color: #0a0a0a;
          font-family: Helvetica, Arial,
            sans-serif;
          font-size: 16px;
          font-weight: 400;
          hyphens: auto;
          line-height: 1.3;
          margin: 0;
          padding: 5px 5px !important;
          padding-bottom: 0;
          padding-left: 0;
          padding-right: 0;
          padding-top: 0;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
        "
      >
        Php ${item.priceAcquired}
      </td>
    </tr>`;
    });
  };

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  lang="en"
  xml:lang="en"
  style="background: #f90 !important"
>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title></title>
    <style>
      @media only screen {
        html {
          min-height: 100%;
          background: #f3f3f3;
        }
      }
      @media only screen and (max-width: 596px) {
        .small-float-center {
          margin: 0 auto !important;
          float: none !important;
          text-align: center !important;
        }
      }
      @media only screen and (max-width: 596px) {
        table.body img {
          width: auto;
          height: auto;
        }
        table.body center {
          min-width: 0 !important;
        }
        table.body .container {
          width: 95% !important;
        }
        table.body .columns {
          height: auto !important;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        table.body .columns .columns {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        table.body .collapse .columns {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        th.small-6 {
          display: inline-block !important;
          width: 50% !important;
        }
        th.small-12 {
          display: inline-block !important;
          width: 100% !important;
        }
        .columns th.small-12 {
          display: block !important;
          width: 100% !important;
        }
        table.menu {
          width: 100% !important;
        }
        table.menu td,
        table.menu th {
          width: auto !important;
          display: inline-block !important;
        }
        table.menu.vertical td,
        table.menu.vertical th {
          display: block !important;
        }
        table.menu[align="center"] {
          width: auto !important;
        }
      }
    </style>
  </head>
  <body
    style="
      -moz-box-sizing: border-box;
      -ms-text-size-adjust: 100%;
      -webkit-box-sizing: border-box;
      -webkit-text-size-adjust: 100%;
      margin: 0;
      background: #f90 !important;
      box-sizing: border-box;
      color: #0a0a0a;
      font-family: Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.3;
      margin: 0;
      min-width: 100%;
      padding: 0;
      padding-bottom: 0;
      padding-left: 0;
      padding-right: 0;
      padding-top: 0;
      text-align: left;
      width: 100% !important;
    "
  >
    <span
      class="preheader"
      style="
        color: #f3f3f3;
        display: none !important;
        font-size: 1px;
        line-height: 1px;
        max-height: 0;
        max-width: 0;
        mso-hide: all !important;
        opacity: 0;
        overflow: hidden;
        visibility: hidden;
      "
    ></span>
    <table
      class="body"
      style="
        margin: 0;
        background: #f90 !important;
        border-collapse: collapse;
        border-spacing: 0;
        color: #0a0a0a;
        font-family: Helvetica, Arial, sans-serif;
        font-size: 16px;
        font-weight: 400;
        height: 100%;
        line-height: 1.3;
        margin: 0;
        padding-bottom: 0;
        padding-left: 0;
        padding-right: 0;
        padding-top: 0;
        text-align: left;
        vertical-align: top;
        width: 100%;
      "
    >
      <tr
        style="
          padding-bottom: 0;
          padding-left: 0;
          padding-right: 0;
          padding-top: 0;
          text-align: left;
          vertical-align: top;
        "
      >
        <td
          class="center"
          align="center"
          valign="top"
          style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            margin: 0;
            border-collapse: collapse !important;
            color: #0a0a0a;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 16px;
            font-weight: 400;
            hyphens: auto;
            line-height: 1.3;
            margin: 0;
            padding-bottom: 0;
            padding-left: 0;
            padding-right: 0;
            padding-top: 0;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          "
        >
          <center style="min-width: 580px; width: 100%">
            <table
              align="center"
              class="container float-center"
              style="
                margin: 0 auto;
                background: #fefefe;
                border-collapse: collapse;
                border-spacing: 0;
                float: none;
                margin: 0 auto;
                padding-bottom: 0;
                padding-left: 0;
                padding-right: 0;
                padding-top: 0;
                text-align: center;
                vertical-align: top;
                width: 580px;
              "
            >
              <tbody>
                <tr
                  style="
                    padding-bottom: 0;
                    padding-left: 0;
                    padding-right: 0;
                    padding-top: 0;
                    text-align: left;
                    vertical-align: top;
                  "
                >
                  <td
                    style="
                      -moz-hyphens: auto;
                      -webkit-hyphens: auto;
                      margin: 0;
                      border-collapse: collapse !important;
                      color: #0a0a0a;
                      font-family: Helvetica, Arial, sans-serif;
                      font-size: 16px;
                      font-weight: 400;
                      hyphens: auto;
                      line-height: 1.3;
                      margin: 0;
                      padding-bottom: 0;
                      padding-left: 0;
                      padding-right: 0;
                      padding-top: 0;
                      text-align: left;
                      vertical-align: top;
                      word-wrap: break-word;
                    "
                  >
                    <table
                      class="spacer"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        padding-bottom: 0;
                        padding-left: 0;
                        padding-right: 0;
                        padding-top: 0;
                        text-align: left;
                        vertical-align: top;
                        width: 100%;
                      "
                    >
                      <tbody>
                        <tr
                          style="
                            padding-bottom: 0;
                            padding-left: 0;
                            padding-right: 0;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                          "
                        >
                          <td
                            height="30"
                            style="
                              -moz-hyphens: auto;
                              -webkit-hyphens: auto;
                              margin: 0;
                              border-collapse: collapse !important;
                              color: #0a0a0a;
                              font-family: Helvetica, Arial, sans-serif;
                              font-size: 30px;
                              font-weight: 400;
                              hyphens: auto;
                              line-height: 30px;
                              margin: 0;
                              mso-line-height-rule: exactly;
                              padding-bottom: 0;
                              padding-left: 0;
                              padding-right: 0;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              word-wrap: break-word;
                            "
                          >
                            &nbsp;
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      class="row"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        display: table;
                        padding: 0;
                        padding-bottom: 0;
                        padding-left: 0;
                        padding-right: 0;
                        padding-top: 0;
                        position: relative;
                        text-align: left;
                        vertical-align: top;
                        width: 100%;
                      "
                    >
                      <tbody>
                        <tr
                          style="
                            padding-bottom: 0;
                            padding-left: 0;
                            padding-right: 0;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                          "
                        >
                          <th
                            class="small-12 large-12 columns first last"
                            style="
                              -moz-hyphens: auto;
                              -webkit-hyphens: auto;
                              margin: 0 auto;
                              border-collapse: collapse !important;
                              color: #0a0a0a;
                              font-family: Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              font-weight: 400;
                              hyphens: auto;
                              line-height: 1.3;
                              margin: 0 auto;
                              padding-bottom: 16px;
                              padding-left: 16px;
                              padding-right: 16px;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              width: 564px;
                              word-wrap: break-word;
                            "
                          >
                            <table
                              style="
                                border-collapse: collapse;
                                border-spacing: 0;
                                padding-bottom: 0;
                                padding-left: 0;
                                padding-right: 0;
                                padding-top: 0;
                                text-align: left;
                                vertical-align: top;
                                width: 100%;
                              "
                            >
                              <tbody>
                                <tr
                                  style="
                                    padding-bottom: 0;
                                    padding-left: 0;
                                    padding-right: 0;
                                    padding-top: 0;
                                    text-align: left;
                                    vertical-align: top;
                                  "
                                >
                                  <th
                                    style="
                                      -moz-hyphens: auto;
                                      -webkit-hyphens: auto;
                                      margin: 0;
                                      border-collapse: collapse !important;
                                      color: #0a0a0a;
                                      font-family: Helvetica, Arial, sans-serif;
                                      font-size: 16px;
                                      font-weight: 400;
                                      hyphens: auto;
                                      line-height: 1.3;
                                      margin: 0;
                                      padding-bottom: 0;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 0;
                                      text-align: left;
                                      vertical-align: top;
                                      word-wrap: break-word;
                                    "
                                  >
                                    <h1
                                      class="tw-black"
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: inherit;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 34px;
                                        font-weight: 900;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                        word-wrap: normal;
                                      "
                                    >
                                      Greetings, ${customerName}
                                    </h1>
                                    <p
                                      class="tw-light"
                                      style="
                                        margin: 0;
                                        margin-bottom: 20px;
                                        color: #0a0a0a;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 16px;
                                        font-weight: 300;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                      "
                                    >
                                      Thank you for purchasing Star City
                                      tickets! We hope that you have an awesome
                                      experience and enjoy our rides and
                                      attractions. 
                                    </p>
                                    <p
                                      class="tw-light"
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: #0a0a0a;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 16px;
                                        font-weight: 300;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                      "
                                    >  
                                      These QR Codes are your tickets to the park and are <strong>valid until ${
                                        data.expiryDate
                                      }.</strong> 
                                      Please download the QR codes and print or save in your mobile phone for scanning 
                                      at the park's main entrance turnstiles. One QR code per person. 
                                    </p>
                                    <p
                                      class="tw-light"
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: #0a0a0a;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 16px;
                                        font-weight: 300;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                      "
                                    >  
                                      Please also print or screenshot this Acknowledgement Receipt as Star City reserves the right to demand presentation of the same before entry to the park. 
                                    </p>
                                    <p
                                      class="tw-light"
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: #CC0000;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 16px;
                                        font-weight: 700;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                      "
                                    >
                                      Please visit our website <a href="http://www.starcity.com.ph" target="_blank">http://www.starcity.com.ph</a> and social media pages (Facebook and Instagram) for park operation schedule or updates on the day of your intended visit.
                                    </p>
                                    <p
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: #0a0a0a;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 16px;
                                        font-weight: 400;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                      "
                                    >
                                      Your Reference ID number is ${refId}
                                    </p>
                                    <table
                                      class="spacer"
                                      style="
                                        border-collapse: collapse;
                                        border-spacing: 0;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                        vertical-align: top;
                                        width: 100%;
                                      "
                                    >
                                      <tbody>
                                        <tr
                                          style="
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                          "
                                        >
                                          <td
                                            height="20"
                                            style="
                                              -moz-hyphens: auto;
                                              -webkit-hyphens: auto;
                                              margin: 0;
                                              border-collapse: collapse !important;
                                              color: #0a0a0a;
                                              font-family: Helvetica, Arial,
                                                sans-serif;
                                              font-size: 20px;
                                              font-weight: 400;
                                              hyphens: auto;
                                              line-height: 20px;
                                              margin: 0;
                                              mso-line-height-rule: exactly;
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              word-wrap: break-word;
                                            "
                                          >
                                            &nbsp;
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <center
                                      style="min-width: 532px; width: 100%"
                                    >
                                      <table
                                        class="
                                          button
                                          warning
                                          large
                                          float-center
                                        "
                                        style="
                                          margin: 0 0 16px 0;
                                          border-collapse: collapse;
                                          border-spacing: 0;
                                          float: none;
                                          margin: 0 0 16px 0;
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: center;
                                          vertical-align: top;
                                          width: auto;
                                        "
                                      >
                                        <tbody>
                                          <tr
                                            style="
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                            "
                                          >
                                            <td
                                              style="
                                                -moz-hyphens: auto;
                                                -webkit-hyphens: auto;
                                                margin: 0;
                                                border-collapse: collapse !important;
                                                color: #0a0a0a;
                                                font-family: Helvetica, Arial,
                                                  sans-serif;
                                                font-size: 16px;
                                                font-weight: 400;
                                                hyphens: auto;
                                                line-height: 1.3;
                                                margin: 0;
                                                padding-bottom: 0;
                                                padding-left: 0;
                                                padding-right: 0;
                                                padding-top: 0;
                                                text-align: left;
                                                vertical-align: top;
                                                word-wrap: break-word;
                                              "
                                            >
                                              <table
                                                style="
                                                  border-collapse: collapse;
                                                  border-spacing: 0;
                                                  padding-bottom: 0;
                                                  padding-left: 0;
                                                  padding-right: 0;
                                                  padding-top: 0;
                                                  text-align: left;
                                                  vertical-align: top;
                                                  width: 100%;
                                                "
                                              >
                                                <tbody>
                                                  <tr
                                                    style="
                                                      padding-bottom: 0;
                                                      padding-left: 0;
                                                      padding-right: 0;
                                                      padding-top: 0;
                                                      text-align: left;
                                                      vertical-align: top;
                                                    "
                                                  >
                                                    <td
                                                      style="
                                                        -moz-hyphens: auto;
                                                        -webkit-hyphens: auto;
                                                        margin: 0;
                                                        background: #ffae00;
                                                        border: 0 solid #ffae00;
                                                        border-collapse: collapse !important;
                                                        color: #fefefe;
                                                        font-family: Helvetica,
                                                          Arial, sans-serif;
                                                        font-size: 16px;
                                                        font-weight: 400;
                                                        hyphens: auto;
                                                        line-height: 1.3;
                                                        margin: 0;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: left;
                                                        vertical-align: top;
                                                        word-wrap: break-word;
                                                      "
                                                    >
                                                      <a
                                                        align="center"
                                                        href="${
                                                          process.env
                                                            .WEBSITE_URL
                                                        }/accesspass?s=${salt}&r=${refId}"
                                                        style="
                                                          border: 0 solid
                                                            #ffae00;
                                                          border-radius: 3px;
                                                          color: #fefefe;
                                                          display: inline-block;
                                                          font-family: Helvetica,
                                                            Arial, sans-serif;
                                                          font-size: 20px;
                                                          font-weight: 700;
                                                          line-height: 1.3;
                                                          padding: 10px 20px
                                                            10px 20px;
                                                          text-align: left;
                                                          text-decoration: none;
                                                        "
                                                        >CLICK HERE TO VIEW
                                                        QR CODES
                                                      </a>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </center>
                                    <table
                                      class="spacer"
                                      style="
                                        border-collapse: collapse;
                                        border-spacing: 0;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                        vertical-align: top;
                                        width: 100%;
                                      "
                                    >
                                      <tbody>
                                        <tr
                                          style="
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                          "
                                        >
                                          <td
                                            height="15"
                                            style="
                                              -moz-hyphens: auto;
                                              -webkit-hyphens: auto;
                                              margin: 0;
                                              border-collapse: collapse !important;
                                              color: #0a0a0a;
                                              font-family: Helvetica, Arial,
                                                sans-serif;
                                              font-size: 15px;
                                              font-weight: 400;
                                              hyphens: auto;
                                              line-height: 15px;
                                              margin: 0;
                                              mso-line-height-rule: exactly;
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              word-wrap: break-word;
                                            "
                                          >
                                            &nbsp;
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table
                                      class="row"
                                      style="
                                        border-collapse: collapse;
                                        border-spacing: 0;
                                        display: table;
                                        padding: 0;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        position: relative;
                                        text-align: left;
                                        vertical-align: top;
                                        width: 100%;
                                      "
                                    >
                                      <tbody>
                                        <tr
                                          style="
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                          "
                                        >
                                          <th
                                            class="
                                              small-12
                                              large-6
                                              columns
                                              first
                                            "
                                            style="
                                              -moz-hyphens: auto;
                                              -webkit-hyphens: auto;
                                              margin: 0 auto;
                                              border-collapse: collapse !important;
                                              color: #0a0a0a;
                                              font-family: Helvetica, Arial,
                                                sans-serif;
                                              font-size: 16px;
                                              font-weight: 400;
                                              hyphens: auto;
                                              line-height: 1.3;
                                              margin: 0 auto;
                                              padding-bottom: 16px;
                                              padding-left: 0 !important;
                                              padding-right: 8px;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              width: 50%;
                                              word-wrap: break-word;
                                            "
                                          >
                                            <table
                                              style="
                                                border-collapse: collapse;
                                                border-spacing: 0;
                                                padding-bottom: 0;
                                                padding-left: 0;
                                                padding-right: 0;
                                                padding-top: 0;
                                                text-align: left;
                                                vertical-align: top;
                                                width: 100%;
                                              "
                                            >
                                              <tbody>
                                                <tr
                                                  style="
                                                    padding-bottom: 0;
                                                    padding-left: 0;
                                                    padding-right: 0;
                                                    padding-top: 0;
                                                    text-align: left;
                                                    vertical-align: top;
                                                  "
                                                >
                                                  <th
                                                    style="
                                                      -moz-hyphens: auto;
                                                      -webkit-hyphens: auto;
                                                      margin: 0;
                                                      border-collapse: collapse !important;
                                                      color: #0a0a0a;
                                                      font-family: Helvetica,
                                                        Arial, sans-serif;
                                                      font-size: 16px;
                                                      font-weight: 400;
                                                      hyphens: auto;
                                                      line-height: 1.3;
                                                      margin: 0;
                                                      padding-bottom: 0;
                                                      padding-left: 0;
                                                      padding-right: 0;
                                                      padding-top: 0;
                                                      text-align: left;
                                                      vertical-align: top;
                                                      word-wrap: break-word;
                                                    "
                                                  >
                                                    <p
                                                      style="
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        color: #0a0a0a;
                                                        font-family: Helvetica,
                                                          Arial, sans-serif;
                                                        font-size: 16px;
                                                        font-weight: 400;
                                                        line-height: 1.3;
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: left;
                                                      "
                                                    >
                                                      <span
                                                        class="tw-bold"
                                                        style="font-weight: 700"
                                                        >Customer Name</span
                                                      ><br /><span
                                                        class="tw-light"
                                                        style="font-weight: 300"
                                                        >${customerName}</span
                                                      >
                                                    </p>
                                                    <p
                                                      style="
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        color: #0a0a0a;
                                                        font-family: Helvetica,
                                                          Arial, sans-serif;
                                                        font-size: 16px;
                                                        font-weight: 400;
                                                        line-height: 1.3;
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: left;
                                                      "
                                                    >
                                                      <strong
                                                        >Email Address</strong
                                                      ><br /><span
                                                        class="tw-light"
                                                        style="font-weight: 300"
                                                        >${emailAddress}</span
                                                      >
                                                    </p>
                                                    <p
                                                      style="
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        color: #0a0a0a;
                                                        font-family: Helvetica,
                                                          Arial, sans-serif;
                                                        font-size: 16px;
                                                        font-weight: 400;
                                                        line-height: 1.3;
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: left;
                                                      "
                                                    >
                                                      <strong
                                                        >Mobile Number</strong
                                                      ><br /><span
                                                        class="tw-light"
                                                        style="font-weight: 300"
                                                        >${contactNumber}</span
                                                      >
                                                    </p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th
                                            class="
                                              small-12
                                              large-6
                                              columns
                                              last
                                            "
                                            style="
                                              -moz-hyphens: auto;
                                              -webkit-hyphens: auto;
                                              margin: 0 auto;
                                              border-collapse: collapse !important;
                                              color: #0a0a0a;
                                              font-family: Helvetica, Arial,
                                                sans-serif;
                                              font-size: 16px;
                                              font-weight: 400;
                                              hyphens: auto;
                                              line-height: 1.3;
                                              margin: 0 auto;
                                              padding-bottom: 16px;
                                              padding-left: 8px;
                                              padding-right: 0 !important;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              width: 50%;
                                              word-wrap: break-word;
                                            "
                                          >
                                            <table
                                              style="
                                                border-collapse: collapse;
                                                border-spacing: 0;
                                                padding-bottom: 0;
                                                padding-left: 0;
                                                padding-right: 0;
                                                padding-top: 0;
                                                text-align: left;
                                                vertical-align: top;
                                                width: 100%;
                                              "
                                            >
                                              <tbody>
                                                <tr
                                                  style="
                                                    padding-bottom: 0;
                                                    padding-left: 0;
                                                    padding-right: 0;
                                                    padding-top: 0;
                                                    text-align: left;
                                                    vertical-align: top;
                                                  "
                                                >
                                                  <th
                                                    style="
                                                      -moz-hyphens: auto;
                                                      -webkit-hyphens: auto;
                                                      margin: 0;
                                                      border-collapse: collapse !important;
                                                      color: #0a0a0a;
                                                      font-family: Helvetica,
                                                        Arial, sans-serif;
                                                      font-size: 16px;
                                                      font-weight: 400;
                                                      hyphens: auto;
                                                      line-height: 1.3;
                                                      margin: 0;
                                                      padding-bottom: 0;
                                                      padding-left: 0;
                                                      padding-right: 0;
                                                      padding-top: 0;
                                                      text-align: left;
                                                      vertical-align: top;
                                                      word-wrap: break-word;
                                                    "
                                                  >
                                                    <p
                                                      style="
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        color: #0a0a0a;
                                                        font-family: Helvetica,
                                                          Arial, sans-serif;
                                                        font-size: 16px;
                                                        font-weight: 400;
                                                        line-height: 1.3;
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: left;
                                                      "
                                                    >
                                                      <span
                                                        class="tw-bold"
                                                        style="font-weight: 700"
                                                        >Payment Gateway</span
                                                      ><br /><span
                                                        class="tw-light"
                                                        style="font-weight: 300"
                                                        >${
                                                          paymentDetails.option
                                                            .name
                                                        }</span
                                                      >
                                                    </p>
                                                    <p
                                                      style="
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        color: #0a0a0a;
                                                        font-family: Helvetica,
                                                          Arial, sans-serif;
                                                        font-size: 16px;
                                                        font-weight: 400;
                                                        line-height: 1.3;
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: left;
                                                      "
                                                    >
                                                      <strong
                                                        >Transaction
                                                        Number</strong
                                                      ><br /><span
                                                        class="tw-light"
                                                        style="font-weight: 300"
                                                        >${
                                                          paymentDetails.referenceNumber
                                                        }</span
                                                      >
                                                    </p>
                                                    <p
                                                      style="
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        color: #0a0a0a;
                                                        font-family: Helvetica,
                                                          Arial, sans-serif;
                                                        font-size: 16px;
                                                        font-weight: 400;
                                                        line-height: 1.3;
                                                        margin: 0;
                                                        margin-bottom: 10px;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: left;
                                                      "
                                                    >
                                                      <strong
                                                        >Amount Paid</strong
                                                      ><br /><span
                                                        class="tw-light"
                                                        style="font-weight: 300"
                                                        >${orderTotal}</span
                                                      >
                                                    </p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table
                                      class="spacer"
                                      style="
                                        border-collapse: collapse;
                                        border-spacing: 0;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                        vertical-align: top;
                                        width: 100%;
                                      "
                                    >
                                      <tbody>
                                        <tr
                                          style="
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                          "
                                        >
                                          <td
                                            height="30"
                                            style="
                                              -moz-hyphens: auto;
                                              -webkit-hyphens: auto;
                                              margin: 0;
                                              border-collapse: collapse !important;
                                              color: #0a0a0a;
                                              font-family: Helvetica, Arial,
                                                sans-serif;
                                              font-size: 30px;
                                              font-weight: 400;
                                              hyphens: auto;
                                              line-height: 30px;
                                              margin: 0;
                                              mso-line-height-rule: exactly;
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              word-wrap: break-word;
                                            "
                                          >
                                            &nbsp;
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <h4
                                      class="text-center tw-bold"
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: inherit;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 24px;
                                        font-weight: 700;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: center;
                                        word-wrap: normal;
                                      "
                                    >
                                      Purchase Details
                                    </h4>
                                    <table
                                      class="pd-table"
                                      style="
                                        border-collapse: collapse;
                                        border-spacing: 0;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                        vertical-align: top;
                                        width: 100%;
                                      "
                                    >
                                      <tr
                                        style="
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: left;
                                          vertical-align: top;
                                        "
                                      >
                                        <th
                                          style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial,
                                              sans-serif;
                                            font-size: 16px;
                                            font-weight: 600;
                                            hyphens: auto;
                                            line-height: 1.3;
                                            margin: 0;
                                            padding: 5px 5px !important;
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            word-wrap: break-word;
                                          "
                                        >
                                          Ticket Type
                                        </th>
                                        <th
                                          style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial,
                                              sans-serif;
                                            font-size: 16px;
                                            font-weight: 600;
                                            hyphens: auto;
                                            line-height: 1.3;
                                            margin: 0;
                                            padding: 5px 5px !important;
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            word-wrap: break-word;
                                          "
                                        >
                                          Qty
                                        </th>
                                        <th
                                          style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial,
                                              sans-serif;
                                            font-size: 16px;
                                            font-weight: 600;
                                            hyphens: auto;
                                            line-height: 1.3;
                                            margin: 0;
                                            padding: 5px 5px !important;
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            word-wrap: break-word;
                                          "
                                        >
                                          Price
                                        </th>
                                      </tr>
                                      ${showParticulars()}
                                      <tr
                                        style="
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: left;
                                          vertical-align: top;
                                        "
                                      >
                                        <td
                                          colspan="2"
                                          style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial,
                                              sans-serif;
                                            font-size: 16px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 1.3;
                                            margin: 0;
                                            padding: 5px 5px !important;
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            word-wrap: break-word;
                                          "
                                        >
                                          <b>Subtotal:</b>
                                        </td>
                                        <td
                                          style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial,
                                              sans-serif;
                                            font-size: 16px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 1.3;
                                            margin: 0;
                                            padding: 5px 5px !important;
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            word-wrap: break-word;
                                          "
                                        >
                                          Php ${orderTotal}
                                        </td>
                                      </tr>
                                    </table>
                                    <hr />
                                  </th>
                                </tr>
                              </tbody>
                            </table>
                          </th>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      class="row footer text-center"
                      style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        display: table;
                        padding: 0;
                        padding-bottom: 0;
                        padding-left: 0;
                        padding-right: 0;
                        padding-top: 0;
                        position: relative;
                        text-align: center;
                        vertical-align: top;
                        width: 100%;
                      "
                    >
                      <tbody>
                        <tr
                          style="
                            padding-bottom: 0;
                            padding-left: 0;
                            padding-right: 0;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                          "
                        >
                          <th
                            class="small-12 large-6 columns first"
                            style="
                              -moz-hyphens: auto;
                              -webkit-hyphens: auto;
                              margin: 0 auto;
                              border-collapse: collapse !important;
                              color: #0a0a0a;
                              font-family: Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              font-weight: 400;
                              hyphens: auto;
                              line-height: 1.3;
                              margin: 0 auto;
                              padding-bottom: 16px;
                              padding-left: 16px;
                              padding-right: 8px;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              width: 274px;
                              word-wrap: break-word;
                            "
                          >
                            <table
                              style="
                                border-collapse: collapse;
                                border-spacing: 0;
                                padding-bottom: 0;
                                padding-left: 0;
                                padding-right: 0;
                                padding-top: 0;
                                text-align: left;
                                vertical-align: top;
                                width: 100%;
                              "
                            >
                              <tbody>
                                <tr
                                  style="
                                    padding-bottom: 0;
                                    padding-left: 0;
                                    padding-right: 0;
                                    padding-top: 0;
                                    text-align: left;
                                    vertical-align: top;
                                  "
                                >
                                  <th
                                    style="
                                      -moz-hyphens: auto;
                                      -webkit-hyphens: auto;
                                      margin: 0;
                                      border-collapse: collapse !important;
                                      color: #0a0a0a;
                                      font-family: Helvetica, Arial, sans-serif;
                                      font-size: 16px;
                                      font-weight: 400;
                                      hyphens: auto;
                                      line-height: 1.3;
                                      margin: 0;
                                      padding-bottom: 0;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 0;
                                      text-align: left;
                                      vertical-align: top;
                                      word-wrap: break-word;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: #0a0a0a;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 12px !important;
                                        font-weight: 400;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                      "
                                    >
                                      <strong>Star Parks Corporation</strong
                                      ><br />Call us at 8-473-28-45<br />Email
                                      us at helpdesk@starcity.com.ph
                                    </p>
                                  </th>
                                </tr>
                              </tbody>
                            </table>
                          </th>
                          <th
                            class="small-12 large-6 columns last"
                            style="
                              -moz-hyphens: auto;
                              -webkit-hyphens: auto;
                              margin: 0 auto;
                              border-collapse: collapse !important;
                              color: #0a0a0a;
                              font-family: Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              font-weight: 400;
                              hyphens: auto;
                              line-height: 1.3;
                              margin: 0 auto;
                              padding-bottom: 16px;
                              padding-left: 8px;
                              padding-right: 16px;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              width: 274px;
                              word-wrap: break-word;
                            "
                          >
                            <table
                              style="
                                border-collapse: collapse;
                                border-spacing: 0;
                                padding-bottom: 0;
                                padding-left: 0;
                                padding-right: 0;
                                padding-top: 0;
                                text-align: left;
                                vertical-align: top;
                                width: 100%;
                              "
                            >
                              <tbody>
                                <tr
                                  style="
                                    padding-bottom: 0;
                                    padding-left: 0;
                                    padding-right: 0;
                                    padding-top: 0;
                                    text-align: left;
                                    vertical-align: top;
                                  "
                                >
                                  <th
                                    style="
                                      -moz-hyphens: auto;
                                      -webkit-hyphens: auto;
                                      margin: 0;
                                      border-collapse: collapse !important;
                                      color: #0a0a0a;
                                      font-family: Helvetica, Arial, sans-serif;
                                      font-size: 16px;
                                      font-weight: 400;
                                      hyphens: auto;
                                      line-height: 1.3;
                                      margin: 0;
                                      padding-bottom: 0;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 0;
                                      text-align: left;
                                      vertical-align: top;
                                      word-wrap: break-word;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        margin-bottom: 10px;
                                        color: #0a0a0a;
                                        font-family: Helvetica, Arial,
                                          sans-serif;
                                        font-size: 12px !important;
                                        font-weight: 400;
                                        line-height: 1.3;
                                        margin: 0;
                                        margin-bottom: 10px;
                                        padding-bottom: 0;
                                        padding-left: 0;
                                        padding-right: 0;
                                        padding-top: 0;
                                        text-align: left;
                                      "
                                    >
                                      MBC Building, V.Sotto Street,<br />CCP
                                      Complex, Roxas Boulevard<br />Pasay City,
                                      Metro Manila
                                    </p>
                                  </th>
                                </tr>
                              </tbody>
                            </table>
                          </th>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </center>
        </td>
      </tr>
    </table>
    <!-- prevent Gmail on iOS font size manipulation -->
    <div
      style="
        display: none;
        white-space: nowrap;
        font: 15px courier;
        line-height: 0;
      "
    >
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
    </div>
  </body>
</html>
`;
};
